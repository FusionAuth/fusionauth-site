---
layout: blog-post
title: Searching FusionAuth docs using an LLM 
description: FusionAuth has made a large language model trained against FusionAuth docs available to the FusionAuth community.
author: Dan Moore
image: blogs/unlimited-custom-domains/unlimited-custom-domains.png
category: announcement
tags: llm documentation tooling docs
excerpt_separator: "<!--more-->"
---

I don't know about you, but when I first encountered ChatGPT, I was blown away. I used it a few times, including to [write a poem about SAML and OIDC](https://twitter.com/mooreds/status/1599787770419220482). Even though it got some of the details wrong, I was impressed.

<!--more-->

But what I immediately started thinking about was what this would mean for technical documentation. See, tech documentation is critical as a developer. Have you ever fished through GitHub repositories, source code, discord or slack, or forums to find a solution to an obscure technical problem? I have, and it's no fun.

So, seeing the ability of ChatGPT and the underlying large language model (LLM) to answer questions, I immediately wanted to see what it could do against the FusionAuth corpus of over 300 docs, thousands of issues across a number of GitHub repositories, and 2000-plus forum posts. While I still believe most developers use Google as their primary documentation interface (ht [Taylor Barnett](https://taylorbar.net/)) I was curious about how an LLM could expose documentation for devs.

## The Startups Cometh

I initially looked to use a tool like [LangChain](https://python.langchain.com/docs/get_started/introduction.html) to build an interface to our documentation. But real life quickly intervened. I didn't think that spending a bunch of time getting up to speed on building an LLM, as fun as it would be, was a good use of my time.

There were a number of startups that thought the same, and built products and companies around applying LLMs to technical documentation. I looked around at one or two startups earlier this year, but there were issues. One choked on the number and size of documents we had, for example. I recall the fact that some of our docs were in asciidoc, not markdown, being an issue as well. And so I set it aside.

Then, I ran across [Kapa, another startup](https://kapa.ai/) which promised they could train a model on any publicly available data and make it easy to access. They had integrations with websites and slack.

Since almost all our documentation is available on the internet, I was interested.

We spun up a proof of concept after a short call, and the FusionAuth team asked the LLM some questions.

It was pretty good. I especially liked how it provided links to existing documentation when it answered questions. This, to me, is critical, because it alleviates my worry about a hallucination. If you are using a LLM as a novel and helpful search interface into existing documentation, that's a far easier problem than if you are treating it as an oracle, possessing all the answers.

## Rolling it out

We're rolling this AI assistant out to the wider FusionAuth community today. It's trained on the website, articles, technical documentation, forum posts, and blog posts right now. If the community finds this useful, we'll be adding it to other places, but for now you'll see it in the lower right hand side of the technical documentation sections. 

<br/>
{% include _image.liquid src="/assets/img/blogs/llm-assistant/initial-screen.png" alt="The LLM assistant awaits." class="img-fluid" figure=false %}

Click or tap on it and type in your question.

{% include _image.liquid src="/assets/img/blogs/llm-assistant/ask-question.png" alt="Type your question." class="img-fluid" figure=false %}

You'll see answers and the aforementioned links to supporting documentation.

{% include _image.liquid src="/assets/img/blogs/llm-assistant/answer-question.png" alt="The LLM assistant answers." class="img-fluid" figure=false %}

Go ahead. Ask your questions!

We hope this will be of use as you learn more about authentication and FusionAuth.

