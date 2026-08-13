const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "256kb" }));
app.use(express.static(path.join(__dirname, "public")));

const items = new Map();

function makeId() {
    return crypto.randomBytes(8).toString("hex");
}

function makeToken() {
    return crypto.randomBytes(24).toString("hex");
}

// ===============================
// WEB
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================
// CREATE
// ===============================

app.post("/api/create", (req, res) => {
    const content = String(req.body?.content || "");

    if (!content.trim()) {
        return res.status(400).json({
            ok: false,
            error: "Content is empty"
        });
    }

    if (content.length > 256000) {
        return res.status(413).json({
            ok: false,
            error: "Content too large"
        });
    }

    const id = makeId();
    const token = makeToken();

    items.set(id, {
        content,
        token,
        created: Date.now()
    });

    res.json({
        ok: true,
        id,
        token,
        url: `/r/${id}`
    });
});

// ===============================
// BROWSER ROUTE
// ===============================

app.get("/r/:id", (req, res) => {
    res.status(403)
        .type("text")
        .send("LEXINX BLOCK");
});

// ===============================
// AUTHENTICATED DATA ENDPOINT
// ===============================

app.post("/api/get", (req, res) => {
    const id = String(req.body?.id || "");
    const token = String(req.body?.token || "");

    const item = items.get(id);

    if (!item) {
        return res.status(404).json({
            ok: false,
            error: "Not found"
        });
    }

    if (!token || token !== item.token) {
        return res.status(403).json({
            ok: false,
            error: "LEXINX BLOCK"
        });
    }

    res.json({
        ok: true,
        content: item.content
    });
});

// ===============================
// 404
// ===============================

app.use((req, res) => {
    res.status(404)
        .type("text")
        .send("LEXINX BLOCK");
});

app.listen(PORT, () => {
    console.log("LEXINX HOST running on port " + PORT);
});
