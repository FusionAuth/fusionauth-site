---
layout: advice
title: Password Security Compliance Checklist
description: Use this combined checklist of leading password recommendations to strengthen your company's password security policy, meet compliance standards, and minimize the risk of data theft.
author: Bryan Giese
image: advice/password-security-checklist-article.png
category: Security
date: 2019-11-04
dateModified: 2019-11-04
---

Right or wrong, usernames and passwords have been a critical component of website and application security for years. However, weak passwords can result in a costly data breach if compromised. To help ensure stronger password security, leading organizations like the National Institute for Standards and Technology have published clear criteria to discourage users from selecting easy to guess passwords. We have assembled those criteria into one checklist of key password recommendations to help you evaluate and improve your own password policies, and to help initiate critical conversations with your engineering, security, and governance teams.

## Legally Required Password Constraints

According to [Verizon's Data Breach Investigations Report](https://enterprise.verizon.com/resources/reports/dbir/ "Jump to Verizon's site"), 81% of hacking-related breaches took advantage of stolen and/or weak passwords. Financial, healthcare, and public sector organizations accounted for half of those breaches. With over four billion credentials stolen in 2019 and the [impact of a data breach averaging $3.86 million](https://www.forbes.com/sites/niallmccarthy/2018/07/13/the-average-cost-of-a-data-breach-is-highest-in-the-u-s-infographic/ "Jump to Forbes article") per incident, password strength has emerged as an effective strategy to benefit overall security. In fact, many organizations are required by law to enforce strict password constraints and requirements. These password requirements are based on extensive study of the mathematical principles of password entropy and are proven to construct stronger passwords. They combine a variety of strategies including:

- Minimum and maximum character counts
- Uppercase and lowercase letter requirements
- Numeric and special character requirements
- Time-based password resets
- Password re-use policies

You can use the following checklist to keep track of your compliance with each of the standards. Anything you check off will be saved in local storage, so you can come back later and pick up where you left off.

### FDA (U.S. Food and Drug Administration)

The FDA regulates food, drugs, biologics, medical devices, electronic products (that give off radiation), cosmetics, veterinary products, and tobacco products.

<label class="d-block">
<input type="checkbox" name="1"/> At least 8, but no more than 32 characters
</label>
<label class="d-block">
<input type="checkbox" name="2"/> At least one uppercase letter
</label>
<label class="d-block">
<input type="checkbox" name="3"/> At least one lowercase letter
</label>
<label class="d-block">
<input type="checkbox" name="4"/> At least one special characters
</label>
<label class="d-block">
<input type="checkbox" name="5"/> At least one number
</label>
<label class="d-block">
<input type="checkbox" name="6"/> Passwords must be changed every 90 days
</label>

### HIPAA (Health Insurance Portability and Accountability Act)

Any organization that deals with protected health information (PHI) must ensure HIPAA compliance.

<label class="d-block">
<input type="checkbox" name="7"/> At least 6, preferably 8, characters in length
</label>
<label class="d-block">
<input type="checkbox" name="8"/> Combination of uppercase and lowercase letters, mixed with numbers and symbols
</label>
<label class="d-block">
<input type="checkbox" name="9"/> Passwords should be changed every 45 to 90 days
</label>
<label class="d-block">
<input type="checkbox" name="10"/> Cannot be the same as any of the user's last 12 passwords
</label>

### PCI DSS (Payment Card Industry Data Security Standard)

Any organization that deals with payment card data must be PCI compliant-whether payment card processing is the company's primary function or not.

<label class="d-block">
<input type="checkbox" name="11"/> At least 7 characters
</label>
<label class="d-block">
<input type="checkbox" name="12"/> Have a mix of both letters and numbers
</label>
<label class="d-block">
<input type="checkbox" name="13"/> Passwords must be changed every 90 days
</label>
<label class="d-block">
<input type="checkbox" name="14"/> Cannot be the same as any of the user's last four passwords
</label>

### SOC2 (Service Organization Control)

Established by the AICPA (American Institute of CPAs), SOC 2 applies to all companies using the cloud to store customers' information.

<label class="d-block">
<input type="checkbox" name="15"/> At least 8 characters in length
</label>
<label class="d-block">
<input type="checkbox" name="16"/> Lower and uppercase letters
</label>
<label class="d-block">
<input type="checkbox" name="17"/> One number
</label>
<label class="d-block">
<input type="checkbox" name="18"/> One symbol
</label>

### NIST (United States National Institute for Standards and Technology)

Updated in 2019, NIST produces guidelines to help federal agencies meet the requirements of the FISMA (Federal Information Security Management Act), however other organizations reference NIST for strong security standards. The NIST guidelines were updated in 2019. NIST sets the precedence and these standards often trickle down to other regulations such as HIPAA and SOC. It is likely there will be a shift in favor of password length and user friendliness.

<label class="d-block">
<input type="checkbox" name="19"/> Minimum of 8 characters when a human sets it
</label>
<label class="d-block">
<input type="checkbox" name="20"/> Minimum of 6 characters when set by a system or service
</label>
<label class="d-block">
<input type="checkbox" name="21"/> Maximum length no less than 64 characters (higher maximums are okay) 
</label>
<label class="d-block">
<input type="checkbox" name="22"/> Support all ASCII characters (including space)
</label>
<label class="d-block">
<input type="checkbox" name="23"/> No mandatory password changes
</label>
<label class="d-block">
<input type="checkbox" name="24"/> No special character requirement
</label>
<label class="d-block">
<input type="checkbox" name="25"/> Passwords checked against known breached lists
</label>
<label class="d-block">
<input type="checkbox" name="26"/> Passwords checked against common dictionaries
</label>
<label class="d-block">
<input type="checkbox" name="27"/> No truncation of passwords during processing
</label>
<label class="d-block">
<input type="checkbox" name="28"/> No password hints
</label>
<label class="d-block">
<input type="checkbox" name="28"/> No recovery questions (i.e. mother's maiden name)
</label>

## Conclusion

Password security is a vital part of compliance and helps organizations protect user data and maintain customer trust. While these password requirements won't eliminate all your password issues, they will go a long way to make your system more secure from the most common hacking attacks. Be sure your identity solution has built-in capabilities to help you stay up-to-date with frequently changing password compliance requirements. It will help strengthen password security, keep your customer information secure, and keep your business thriving.

{% include _advice-get-started.liquid intro="If you are looking for a solution that covers all of these password regulations, FusionAuth has you covered." %}

<script type="text/javascript">
Prime.Document.onReady(function() {
  Prime.Document.query('input[type=checkbox]').each(function(e) {
    var value = Prime.Storage.getLocalObject('fusionAuthPasswordChecklist' + e.getAttribute('name'));
    if (value) {
      e.setChecked(value);
    }
    
    e.addEventListener('change', function(event) {
      var element = new Prime.Document.Element(event.currentTarget);
      Prime.Storage.setLocalObject('fusionAuthPasswordChecklist' + element.getAttribute('name'), element.isChecked());
    });
  });
});
</script>