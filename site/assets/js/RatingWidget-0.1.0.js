(function(d, t, e, m){
  window.RW_Async_Init = function() {
    RW.init({
              huid: "445749",
              uid: "db2a0f94c2d504f056b5b678148f7646",
              source: "website",
              options: {
                "imgUrl": {
                  "ltr": "/assets/img/stars.png",
                  "rtl": "/assets/img/stars.png"
                },
                "readOnly": document.location.href.charAt(document.location.href.length - 1) === "/",
                "size": "medium",
                "showInfo": false,
                "showTooltip": false,
                "style": "custom",
              }
            });
    RW.render();
  };
  // Append Rating-Widget JavaScript library.
  var rw, s = d.getElementsByTagName(e)[0], id = "rw-js",
    l = d.location, ck = "Y" + t.getFullYear() +
    "M" + t.getMonth() + "D" + t.getDate(), p = l.protocol,
    f = ((l.search.indexOf("DBG=") > -1) ? "" : ".min"),
    a = ("https:" == p ? "secure." + m + "js/" : "js." + m);
  if (d.getElementById(id)) return;
  rw = d.createElement(e);
  rw.id = id; rw.async = true; rw.type = "text/javascript";
  rw.src = p + "//" + a + "external" + f + ".js?ck=" + ck;
  s.parentNode.insertBefore(rw, s);
}(document, new Date(), "script", "rating-widget.com/"));
