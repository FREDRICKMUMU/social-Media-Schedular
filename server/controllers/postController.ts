import { Generation } from './../models/Generation.js';
import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { GoogleGenAI } from "@google/genai";
import { cloudinary } from '../config/cloudinary.js';
import axios from "axios";
import { Post } from "../models/Post.js";

// HELPER TO POLL LEONARDO.AI
const pollLeonardoJob = async (generationId: string, apiKey: string): Promise<string> => {
    const maxRetries = 20;
    const delay = 5000;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axios.get(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${apiKey}`
                }
            });

            const generation = response.data.generations_by_pk;
            if (generation.status === "COMPLETE") {
                if (generation.generated_images && generation.generated_images.length > 0) {
                    return generation.generated_images[0].url;
                }
                throw new Error("Generation complete but no images found.");
            }
            if (generation.status === "FAILED") {
                throw new Error("Leonardo.ai generation failed.");
            }
        } catch (err: any) {
            console.error("Polling error:", err?.response?.data || err.message);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
    }
    throw new Error("Leonardo.ai generation timed out.");
};

// GENERATE POST
// POST /api/posts/generate
export const generatePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { prompt, tone, generateImage } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            res.status(400).json({ message: "Gemini API Key is missing. Please add it to your server/.env file." });
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        // GENERATE TEXT
        const textResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Write a social media post about: "${prompt}". 
                            The tone should be: "${tone}". 
                            Keep it under 280 characters. 
                            Make it engaging and suitable for social media.
                            Return only the post content without any additional text or formatting.`
                        }
                    ]
                }
            ]
        });

        const generatedText = textResponse.text?.trim() || "Unable to generate content.";

        // GENERATE IMAGE (if requested)
        let imageUrl: string | null = null;
        let cloudinaryUrl: string | null = null;

        if (generateImage) {
            const leonardoApiKey = process.env.LEONARDO_API_KEY;
            if (!leonardoApiKey) {
                console.warn("Leonardo.ai API key missing. Skipping image generation.");
            } else {
                try {
                    const generationResponse = await axios.post(
                        "https://cloud.leonardo.ai/api/rest/v1/generations",
                        {
                            modelId: "b24e16ff-06e3-43eb-9d33-4414e45841b5",
                            prompt: `${prompt}, social media post, engaging, ${tone} style, high quality`,
                            num_images: 1,
                            width: 1024,
                            height: 1024,
                            negative_prompt: "text, watermark, blurry, low quality"
                        },
                        {
                            headers: {
                                accept: "application/json",
                                "content-type": "application/json",
                                authorization: `Bearer ${leonardoApiKey}`
                            }
                        }
                    );

                    const generationId = generationResponse.data.generations_by_pk?.id;

                    if (generationId) {
                        imageUrl = await pollLeonardoJob(generationId, leonardoApiKey);

                        if (imageUrl) {
                            try {
                                const uploadResult = await cloudinary.uploader.upload(imageUrl, {
                                    folder: "social-scheduler/generations"
                                });
                                cloudinaryUrl = uploadResult.secure_url;
                            } catch (cloudinaryError) {
                                console.error("Cloudinary upload error:", cloudinaryError);
                                cloudinaryUrl = imageUrl;
                            }
                        }
                    }
                } catch (leonardoError: any) {
                    console.error("Leonardo.ai generation error:", leonardoError?.response?.data || leonardoError.message);
                }
            }
        }

        // GENERATE HASHTAGS
        let hashtags: string[] = [];
        try {
            const hashtagResponse = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `Generate 5 relevant hashtags for this social media post: "${generatedText}". 
                                Return only the hashtags separated by spaces, without the # symbol. 
                                Example: "socialmedia marketing content creation branding engagement"`
                            }
                        ]
                    }
                ]
            });

            const hashtagText = hashtagResponse.text?.trim() || "";
            hashtags = hashtagText.split(" ").filter((tag: string) => tag.length > 0);
        } catch (hashtagError) {
            console.error("Hashtag generation error:", hashtagError);
        }

        // SAVE TO DATABASE
        const generation = await Generation.create({
            user: req.user._id,
            prompt,
            tone,
            content: generatedText,
            mediaUrl: cloudinaryUrl || imageUrl,
            hashtags,
            status: "generated"
        });

        res.status(201).json({
            success: true,
            data: {
                id: generation._id,
                content: generatedText,
                imageUrl: cloudinaryUrl || imageUrl,
                hashtags,
                tone,
                prompt
            }
        });

    } catch (error: any) {
        console.error("Generate post error:", error);
        res.status(500).json({
            message: error?.message || "Failed to generate post"
        });
    }
};

// GET ALL GENERATIONS
// GET /api/posts/generations
export const getGenerations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const generations = await Generation.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: generations
        });

    } catch (error: any) {
        console.error("Get generations error:", error);
        res.status(500).json({
            message: error?.message || "Failed to fetch generations"
        });
    }
};

// SCHEDULE POST
// POST /api/posts
export const schedulePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { content, mediaUrl, platforms, scheduledDate, scheduledTime, generationId } = req.body;

        // If generationId is provided, use that generation
        let finalContent = content;
        let finalMediaUrl = mediaUrl;

        if (generationId) {
            const generation = await Generation.findById(generationId);
            if (!generation) {
                res.status(404).json({ message: "Generation not found" });
                return;
            }
            if (generation.user.toString() !== req.user._id.toString()) {
                res.status(403).json({ message: "Not authorized" });
                return;
            }
            finalContent = generation.content;
            finalMediaUrl = generation.mediaUrl;
            generation.status = "scheduled";
            await generation.save();
        }

        const post = await Post.create({
            user: req.user._id,
            content: finalContent,
            mediaUrl: finalMediaUrl || req.file?.path,
            platforms,
            scheduledFor: new Date(`${scheduledDate}T${scheduledTime}`),
            status: "scheduled",
            generationId: generationId || null
        });

        res.status(201).json({
            success: true,
            data: post
        });

    } catch (error: any) {
        console.error("Schedule post error:", error);
        res.status(500).json({
            message: error?.message || "Failed to schedule post"
        });
    }
};

// GET ALL POSTS
// GET /api/posts
export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const posts = await Post.find({ user: req.user._id })
            .sort({ scheduledFor: 1 });

        res.json({
            success: true,
            data: posts
        });

    } catch (error: any) {
        console.error("Get posts error:", error);
        res.status(500).json({
            message: error?.message || "Failed to fetch posts"
        });
    }
};