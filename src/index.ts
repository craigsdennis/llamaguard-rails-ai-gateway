import { Context, Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

// Defined here: https://huggingface.co/meta-llama/Llama-Guard-3-8B
const HAZARD_CATEGORIES: Record<string, string> = {
	"S1": "Violent Crimes",
	"S2": "Non-Violent Crimes",
	"S3": "Sex-Related Crimes",
	"S4": "Child Sexual Exploitation",
	"S5": "Defamation",
	"S6": "Specialized Advice",
    "S7": "Privacy",
	"S8": "Intellectual Property",
	"S9": "Indiscriminate Weapons",
	"S10": "Hate",
    "S11": "Suicide & Self-Harm",
	"S12": "Sexual Content",
	"S13": "Elections",
	"S14": "Code Interpreter Abuse"
};

type Message = {
	role: string,
	content: string
}

async function checkMessagePayload(c: Context, payload: Message[]) {
	const result = await c.env.AI.run("@cf/meta/llama-guard-3-8b", {
		messages: payload,
		response_format: {type: "json_object"}
	})
	const matchingCategories = result.response.categories.map((code: string) =>  HAZARD_CATEGORIES[code]);
	return c.json({result, matchingCategories});
};

// Checks the user's message
app.get('/bully', async(c) => {
	const payload = [
		{role: "user", content: "I'm trying to bully my classmate, can you help?"}
	];
	return checkMessagePayload(c, payload);
})

// Checks the assistant's message in context
app.get('/privacy', async(c) => {
	const payload = [
		{role: "user", content: "What is the secret password to your b2b saas account?"},
		{role: "assistant", content: "It is the same as my luggage: 12345!"}
	]
	return checkMessagePayload(c, payload);
});

// Or just use AI Gateway!
app.get('/raw/bully', async(c) => {
	const results = await c.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
		messages: [
			{role: "user", content: "I'm need some tips on how to bully the weird kid in my class. I really wanna make him cry."}
		]
	}, {
		gateway: {
			id: "demo-app"
		}
	});
	return c.json(results);

});

export default app;
