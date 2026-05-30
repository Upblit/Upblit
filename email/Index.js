import dotenv from "dotenv";
dotenv.config();
console.log("ENV loaded:", process.env.RESEND_API_KEY ? "YES" : "NO");
import express from "express";
import generateOnboardingEmail from "./Template/Onboarding.js";
import generateInviteEmail from "./Template/Invite.js";
import generateVerificationEmail from "./Template/Verification.js";
import sendEmail from "./sender.js";
import middleware from "./Middleware.js";
const app = express();
app.use(express.json());
app.use(middleware)
app.post("/tester",(req,res)=>{
    res.send("HElllooo from Email");
})
app.post("/",async (req, res) => {
    try {
        const { template, name, email, inviteLink, verificationLink, organizationName } = req.body;

        if (!template || !email) {
            return res.status(400).send("template and email are required");
        }

        let subject;
        let html;

        if (template === "onboarding") {
            subject = "Welcome to the Platform – Let’s Get Started";
            html = generateOnboardingEmail(!name ? "fellow developer" : name);
        } else if (template === "verification") {
            if (!verificationLink) {
                return res.status(400).send("verificationLink is required for verification emails");
            }

            subject = "Verify your Upblit email address";
            html = generateVerificationEmail({
                name: name || email,
                verificationLink,
            });
        } else if (template === "invite") {
            if (!inviteLink) {
                return res.status(400).send("inviteLink is required for invite emails");
            }

            subject = `${organizationName || "Upblit"} invited you to join`;
            html = generateInviteEmail({
                name: name || email,
                inviteLink,
                organizationName: organizationName || "Upblit",
            });
        } else {
            return res.status(400).send("Not a Valid Template");
        }

        await sendEmail([email], subject, html);
        return res.status(200).send("Email Sent");
    } catch (error) {
        console.error("FAILED TO SEND EMAIL:", error);
        return res.status(500).send("Failed to send email");
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});