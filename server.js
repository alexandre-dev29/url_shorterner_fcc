require("dotenv").config();
const express = require("express");
const body_parser = require("body-parser");
const cors = require("cors");
const dns_lookup = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
});

const urlModel = [];

app.post("/api/shorturl", (req, res) => {
    try {
        let regex =
            /https?:\/\/w{0,3}\w*?\.(\w*?\.)?\w{2,3}\S*|www\.(\w*?\.)?\w*?\.\w{2,3}\S*|(\w*?\.)?\w*?\.\w{2,3}[\/\?]\S*/;

        const { url: longUrl } = req.body;
        const { hostname } = new URL(longUrl);
        if (!regex.test(longUrl)) res.send({ error: "invalid URL" });
        else {
            dns_lookup.lookup(hostname, async (err) => {
                if (!err) {
                    const shortenedUrl = urlModel.filter(
                        (element) => element.original_url === longUrl
                    );

                    if (shortenedUrl.length !== 0) {
                        res.send({
                            original_url: longUrl,
                            short_url: shortenedUrl[0].short_url,
                        });
                    } else {
                        const shortUrl = urlModel.length + 1;
                        const url = {
                            original_url: longUrl,
                            short_url: shortUrl,
                        };
                        urlModel.push(url);

                        res.send(url);
                    }
                } else {
                    res.send({ error: "invalid URL" });
                }
            });
        }
    } catch (error) {
        res.send({ error: "invalid URL" });
    }
});

app.get("/api/shorturl/:short_url", (req, res) => {
    const { short_url } = req.params;
    const element = urlModel.filter((ele) => ele.short_url == short_url)[0];
    res.redirect(element.original_url);
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
