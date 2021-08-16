---
layout: blog-post
title: When to self-host critical application components
description: Should you self-host critical parts of your application or use a SaaS provider?
author: Matthew Fuller
image: blogs/when-to-self-host/when-to-self-host-critical-application-components-header-image.png
category: blog
excerpt_separator: "<!--more-->"
---

In April of 2021, Auth0, an identity provider powering authentication for hundreds of websites, experienced an [hours-long outage](https://news.ycombinator.com/item?id=26880147). During the outage, users could not access their authentication portals and many of their websites were rendered unusable due to the broken authentication flows.

<!--more-->

Auth0 joins Microsoft, Amazon, GitHub, and a growing list of cloud and SaaS providers who have experienced major outages in recent years. If you and your operations teams have found yourselves feeling helpless during these outages, you may wonder whether self-hosting the service could provide better reliability for your organization.

Although self-hosting may seem like a simple decision at first, especially in the midst of a major outage, there are a considerable number of factors at play that may complicate your choice. It's important to consider the financial, operational, security, and legal implications before deciding to host a service yourself instead of paying for a managed SaaS counterpart. Choosing to self-host a critical application will impact many departments of your organization and even affect how your organization scales and grows its teams in the future.

## Evolution of self-hosting

{% include _image.liquid src="/assets/img/blogs/when-to-self-host/diagram-comparing-saas-self-hosting.png" alt="A diagram comparing self-hosted to SaaS deployment models." class="img-fluid" figure=false %}

Self-hosting is not a new concept; in fact, it was the default choice prior to the more recent proliferation of SaaS. As software companies discovered the benefits of reliable and recurring revenue from subscription services, and organizations discovered the benefits of consuming specialized software produced by focused teams, the industry shifted from large, release-driven, self-hosted software to continuous releases delivered as as a service (SaaS is an acronym for “software as a service”).

This trend was especially profound in the consumer software business but quickly spread to business software as well. Today, many services are "SaaS first," with only a few offering a self-hosted option that is usually limited to certain customers and plans. [GitHub](https://github.com/enterprise) and [Bitbucket](https://www.atlassian.com/software/bitbucket/enterprise/data-center), for example, only offer self-hosted versions of their software as part of their Enterprise or “Datacenter” plans, which are significantly more expensive than their commercial SaaS offerings.

Taking a different approach, some vendors, such as database providers MongoDB and Elastic, produce both open-source and commercial versions of their software. The open-source versions are provided "as-is" but can be self-hosted and run without licensing costs. These same platforms can alternatively be used as subscription-based SaaS services, in which the company manages the underlying infrastructure and handles all other aspects of operating it in exchange for a recurring fee.

## The benefits of self-hosting

When considering which option is best for your individual organization, it’s important to weigh the pros and cons of each. Self-hosting comes with its fair share of benefits, chief among them compliance friendliness and data ownership.

### Self-hosting to maintain compliance

While many organizations will have the choice between SaaS and self-hosted options, others may not have this luxury. Due to regulatory, compliance, or legal factors, self-hosting may be the only available option. These situations are especially prevalent in heavily regulated environments such as banking, finance, law, and healthcare.

Even if your organization can use a SaaS, there may be more restrictive internal policies set by your legal or risk management departments that dictate whether a service must be self-hosted. For example, you may be permitted to use a SaaS to track IT department tickets but must use self-hosted solutions when managing employee payroll.

Before continuing to evaluate SaaS options, consider the following questions:

* Will this application handle sensitive data such as the personal information of employees or customers, financial records, payment information, or health information?
* Is your organization subject to any compliance or regulatory requirements such as PCI, HIPAA, or FedRamp?
* Do your customers require that all systems handling their data be located within a specific geographic region?

While answering any of these questions affirmatively does not preclude you from using a SaaS version of an application, it will place additional constraints on which application is used. For example, while a company such as Atlassian, the creators of Jira, may be large enough to provide a SaaS solution that is EU compliant by storing its data entirely within the European Union, smaller companies may not be able to afford the additional infrastructure.

Even if you do not have specific compliance obligations, using a [vendor security checklist](https://securityscorecard.com/blog/vendor-risk-management-questionnaire-template) can help your security and risk management teams decide if the SaaS version of an application is suitable for your environment.

### Owning your data

Data ownership is an increasingly complex topic as companies outsource various parts of their development, deployment, and runtime environments to third parties, who in turn outsource the same components to additional vendors. It’s turtles all the way down. For example, your customers' data may live in a database hosted in Amazon Web Services, operated by MongoDB, which outsources metrics to Datadog who in turn hosts their infrastructure on Microsoft Azure.

For organizations operating in industries with stringent data requirements, or who serve customers in those industries, self-hosting may be a feasible option to reduce this sprawl of data ownership. Self-hosting ensures that you have complete control over each piece of the application stack that processes your customers' data. 

### Performance and availability

This control can also help when you have strict performance requirements. Gaming and financial services companies, for example, may find the control of self-hosting their data gives them a performance edge their customers demand.

As mentioned initially, using a SaaS provider such as Auth0 can result in significant impact to your application availability, especially if it is in the critical path for your users. While such major outages are rare, they are extremely frustrating for everyone involved. Self-hosting critical components can empower your team to address availability challenges, whether through process, automation, or infrastructure improvements. 

You can also control the upgrade cycle when you self-host. If you need a feature in the latest release, you can upgrade. If you’d rather remain a few versions back from the bleeding edge, you have the control to slow-roll upgrades.

### Controlling costs

Self-hosting also ensures greater control over the costs of each component in the application and its supporting infrastructure. Unlike SaaS services, which coalesce the costs of infrastructure, data transfer, backups, and other operational management activities into one bill, self-hosting exposes you directly to these costs. In doing so, it gives you greater flexibility to negotiate costs with your hardware and network vendors, sign long-term contracts, or distribute costs across multiple applications through chargebacks. 

While this may not result in favorable rates for smaller organizations, it can result in massive savings for larger enterprises who are willing to commit to longer timeframes and larger network or data utilization contracts.

## The downsides of self-hosting

While self-hosting can provide you with frictionless data ownership and keep your company compliant, there are some downsides to consider. The cost of hosting every needed application component can really start to add up. There is also the operational excellence of SaaS providers that internal teams might not be able to match.

### The hidden costs

The direct price of a software solution is a primary driver of its adoption. Yet in the context of choosing a self-hosted option, the cost goes far beyond the advertised upfront price paid to a vendor. Depending on the vendor's business model, the cost could be impacted by many factors exceeding the base subscription price, including support contracts, overage fees, and solution architecture or consulting rates.

Some applications, especially those produced by open-source or [open-core](https://en.wikipedia.org/wiki/Open-core_model) vendors, may not have any upfront licensing costs. In these cases, you should evaluate whether your organization possesses the operational expertise and hardware needed to run the application according to your uptime and availability requirements. In particular, hiring and retaining operational expertise can be expensive, both in terms of dollars out the door and opportunity costs. If your team is spending time improving the availability of your self hosted service, what are they unable to work on? 

You could consider a hybrid approach of self-hosting the software but paying for a support contract to ensure expertise is on-hand at all times to assist with installing, managing, upgrading, and troubleshooting the application.

In general, the costs for SaaS applications are not directly comparable to their self-hosted equivalents. This is primarily because SaaS pricing tends to amortize higher costs over periodic payments. For example, it may cost the SaaS provider $1,000 in hardware and support staff to onboard a customer to an application that is billed at $500 per month. The upfront monthly payment can be more approachable for smaller companies, despite costing more than self-hosting in the long-term.

These costs can be difficult to compare directly because they are influenced by scale, staffing, existing contracts, and long-term business projections.

### Operational excellence

The popularity of SaaS services has been driven in part by their ease of use. For most deployments, there is no hardware to deploy and no network to configure. Accounts can often be provisioned in minutes, for free or with a business credit card, and configured quickly afterward. The SaaS provider handles the security of the service, upgrading and maintaining the underlying infrastructure, taking backups, complying with regulations, monitoring the service, and restoring access in the event of downtime. As the developers of the software powering the SaaS application, the SaaS provider also has the in-house expertise, the focus and the incentive to quickly resolve bugs and implement feature requests.

Leaders of organizations attempting to self-host an application with these same expectations must ask themselves whether these responsibilities can truly be handled in-house. Consider some of the following questions to determine your organization's operational readiness:

* Will the application need to be available 24/7 with an uptime SLA?
* If so, do you have a global DevOps or SRE team prepared to respond to outages?
* Do your teams have the experience to install, manage, upgrade, and troubleshoot the application?
* Do you have the ability to scale the application using your network and infrastructure?
* What monitoring will you put in place to observe the application and alert on potential issues?
* Are you familiar enough with the performance metrics of the application that need to be monitored to ensure you’ll be able to manage it when usage grows?

If you aren’t certain about the answers in the hypothetical, ask the same questions about any currently self-hosted critical internal application.

Operational excellence is an ongoing, and potentially expensive, requisite for operating self-hosted software. You will need to factor salaries, training, documentation, and internal support into any staffing plans for managing the service, including increases for potential upticks in internal adoption and larger-scale operations as that adoption grows.

## Legal considerations

While the legal considerations of deploying SaaS and self-hosted services may feel nuanced in comparison to larger operational issues, understanding their implications is paramount to a successful deployment. When self-hosting, there will be legal terms dictating what you can and cannot do with the software. It’s crucial to have your legal department review the licensing terms and contracts prior to implementation.

In some rare cases, the terms or licenses for a service may change in future releases, potentially impacting your ability to continue using it. Recently, Elastic, the makers of the popular ElasticSearch database, [underwent a licensing change](https://www.zdnet.com/article/elastic-changes-open-source-license-to-monetize-cloud-service-use/) to limit the ability for competitors to use future versions of their software. While this specific change may not have a direct impact on your self-hosting capabilities, it does demonstrate how your company may be at the mercy of the vendor developing the software.

## A non-permanent choice

Planning a SaaS or self-hosted deployment can feel like a decision set in stone, especially when multiple departments within the company are involved in its rollout. But it's important to remember that many offerings may support hybrid or evolutionary approaches to deployment. For example, this may allow you to move from a SaaS offering to a self-hosted option over time with your data and settings intact.

Conversely, you may also proceed in the opposite direction and begin by self-hosting an open-source or free version of the software before realizing that the operational costs are too significant and moving to a SaaS solution. While you may have no plans to use the alternative options at the time of deployment, it is crucial to work with the vendor to understand what your options are in the future should you decide to change models.

## Conclusion

Deciding between a SaaS or self-hosted version of an application may seem like a daunting choice for any company. However, with a bit of planning, cost modeling, and legal analysis, you can consider all of the factors important to your organization and make the choice that will allow you to deploy quickly, scale seamlessly, and operate within your expected budget.

As your organization and its usage of the service evolves, continuing to evaluate these options will ensure reliable operation for years to come. And remember, if you decide later on that you’ve made the wrong choice, you can always change your mind and switch.

