import { Groq } from "groq-sdk/client";
import { inngest } from "./client";

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY!,
});

type EpisodeAnalysis = {
	summary: string;
	keyPoints: string[];
	chapters: { timestamp: string; title: string }[];
};

export const processEpisode = inngest.createFunction(
	{
		id: "process-episode",
		triggers: [{ event: "episode/uploaded" }],
	},
	async ({ event, step }) => {
		const { audioUrl, episodeId } = event.data as {
			audioUrl: string;
			episodeId: string;
			podcastId?: string;
		};

		const transcript = await step.run("generate-transcript", async () => {
			const response = await groq.audio.transcriptions.create({
				url: audioUrl,
				model: "whisper-large-v3",
				language: "en",
				prompt:
					"Please transcribe the following audio into text. The audio is a podcast episode. The episode is about the topic of the podcast.",
			});
			return response.text;
		});

		const analysis = await step.run("analyze-content", async () => {
			const response = await groq.chat.completions.create({
				model: "llama-3.3-70b-versatile",
				messages: [
					{
						role: "system",
						content:
							"You are a podcast content analyst. Return ONLY valid JSON with no markdown.",
					},
					{
						role: "user",
						content: `Analyze this podcast transcript and return JSON with:
{
  "summary": "2-3 paragraph summary",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "chapters": [{"timestamp": "00:00", "title": "Chapter title"}]
}

Transcript:
${transcript.slice(0, 8000)}`,
					},
				],
			});
			const raw = response.choices[0].message.content;
			return JSON.parse(raw || "{}") as EpisodeAnalysis;
		});

		const titles = await step.run("generate-titles", async () => {
			const response = await groq.chat.completions.create({
				model: "llama-3.3-70b-versatile",
				messages: [
					{
						role: "system",
						content:
							"You are a podcast title expert. Return ONLY a JSON array of 5 strings.",
					},
					{
						role: "user",
						content: `Generate 5 compelling podcast episode titles based on this summary: ${analysis.summary}`,
					},
				],
			});
			return JSON.parse(
				response.choices[0].message.content || "[]",
			) as string[];
		});

		const socialPosts = await step.run("generate-social-posts", async () => {
			const response = await groq.chat.completions.create({
				model: "llama-3.3-70b-versatile",
				messages: [
					{
						role: "system",
						content:
							"You are a social media expert. Return ONLY valid JSON with no markdown.",
					},
					{
						role: "user",
						content: `Create social media posts for this podcast episode.
Summary: ${analysis.summary}

Return JSON:
{
  "twitter": "tweet text with hashtags (max 280 chars)",
  "linkedin": "professional LinkedIn post",
  "instagram": "engaging Instagram caption with emojis and hashtags"
}`,
					},
				],
			});
			return JSON.parse(response.choices[0].message.content || "{}") as Record<
				string,
				string
			>;
		});

		return {
			episodeId,
			transcript,
			summary: analysis.summary,
			keyPoints: analysis.keyPoints,
			chapters: analysis.chapters,
			titles,
			socialPosts,
		};
	},
);
