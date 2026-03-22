import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
	const body = await request.text();

	if (!process.env.CLERK_WEBHOOK_SECRET) {
		return NextResponse.json(
			{ message: "Missing webhook secret" },
			{ status: 500 },
		);
	}
	const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

	const headersList = await headers();
	const svix_id = headersList.get("svix-id");
	const svix_timestamp = headersList.get("svix-timestamp");
	const svix_signature = headersList.get("svix-signature");

	if (!svix_id || !svix_timestamp || !svix_signature) {
		return NextResponse.json(
			{ message: "Missing SVIX headers" },
			{ status: 400 },
		);
	}

	try {
		webhook.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		});
	} catch (err) {
		return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
	}

	const { type, data } = JSON.parse(body);

	switch (type) {
		case "user.created":
		case "user.updated":
			await convex.mutation(api.users.upsertUser, {
				clerkId: data.id,
				email: data.email_addresses[0].email_address,
				name: `${data.first_name} ${data.last_name}`,
				imageUrl: data.image_url,
			});
			return NextResponse.json({ message: "User synced" });
		default:
			return NextResponse.json({ message: "Event received" });
	}
}
