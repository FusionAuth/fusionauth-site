[#switch "${phase}"]
  [#case "start"][#assign message = "The ${action.name} action was applied to your account."][#break]
  [#case "modify"][#assign message = "The ${action.name} action on your account changed."][#break]
  [#case "cancel"][#assign message = "The ${action.name} action on your account was canceled."][#break]
  [#default][#assign message = "The ${action.name} action on your account ended."]
[/#switch]
${message}

[#if (event.reason)??]
Reason: ${event.reason}

[/#if]
- FusionAuth Admin
