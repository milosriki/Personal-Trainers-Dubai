(function () {
  "use strict";

  var SITE = "ptd_resources";
  var SITE_CONFIG = window.PTDR_TRACKING_CONFIG || {};
  var API_ROUTE = SITE_CONFIG.eventEndpoint || "";
  var META_CONFIG = SITE_CONFIG.meta || {};
  var ANALYTICS_CONFIG = SITE_CONFIG.analytics || {};
  var SITE_PROPERTY = SITE_CONFIG.siteProperty || "ptd_resource_hub";
  var SITE_DOMAIN = SITE_CONFIG.siteDomain || "resources.personaltrainersdubai.com";
  var BRAND = SITE_CONFIG.brand || "PTD Fitness";
  var META_PIXEL_IDS = uniqueList(META_CONFIG.pixelIds || SITE_CONFIG.metaPixelIds);
  var GA4_MEASUREMENT_IDS = uniqueList(ANALYTICS_CONFIG.ga4MeasurementIds || SITE_CONFIG.ga4MeasurementIds);
  var SEND_TO_EXISTING_META = META_CONFIG.sendCustomEventsToExistingPixels !== false;
  var SEND_STANDARD_LEAD_TO_EXISTING_META = META_CONFIG.sendStandardLeadToExistingPixels === true;
  var CONVERSION_CONFIG = SITE_CONFIG.conversion || {};
  var LEAD_EVENT = CONVERSION_CONFIG.leadEvent || "ptr_lead";
  var AI_REFERRAL_EVENT = CONVERSION_CONFIG.aiReferralEvent || "ptr_ai_referral";
  var CURRENCY = CONVERSION_CONFIG.currency || "AED";
  var LEAD_VALUES = Object.assign({
    typeform_apply: 150,
    main_site_apply: 150,
    whatsapp_click: 120,
    phone_call: 120,
    email_click: 50,
    onsite_form_submit: 150
  }, CONVERSION_CONFIG.leadValues || {});
  var LEAD_TYPES = Object.assign({
    typeform_apply: "typeform_application_intent",
    main_site_apply: "main_site_application_intent",
    whatsapp_click: "whatsapp_lead_intent",
    phone_call: "phone_lead_intent",
    email_click: "email_contact_intent",
    onsite_form_submit: "onsite_form_submit"
  }, CONVERSION_CONFIG.leadTypes || {});
  var LEAD_NAMES = Object.assign({
    typeform_apply: "Typeform application click",
    main_site_apply: "Main PTD application click",
    whatsapp_click: "WhatsApp consultation click",
    phone_call: "Phone call click",
    email_click: "Email contact click",
    onsite_form_submit: "On-site form submit"
  }, CONVERSION_CONFIG.leadNames || {});
  var ATTRIBUTION_KEYS = [
    "gclid",
    "ttclid",
    "fbclid",
    "gbraid",
    "wbraid",
    "msclkid",
    "li_fat_id",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content"
  ];
  var SEARCH_ENGINES = {
    "google.com": "google",
    "bing.com": "bing",
    "yahoo.com": "yahoo",
    "duckduckgo.com": "duckduckgo",
    "ecosia.org": "ecosia",
    "yandex.com": "yandex",
    "baidu.com": "baidu"
  };
  var SOCIAL_SOURCES = {
    "facebook.com": "facebook",
    "instagram.com": "instagram",
    "tiktok.com": "tiktok",
    "linkedin.com": "linkedin",
    "twitter.com": "x",
    "x.com": "x",
    "youtube.com": "youtube",
    "reddit.com": "reddit"
  };
  var AI_PLATFORM_RULES = [
    { name: "chatgpt", hosts: ["chatgpt.com", "chat.openai.com"], aliases: ["chatgpt", "openai"] },
    { name: "perplexity", hosts: ["perplexity.ai"], aliases: ["perplexity"] },
    { name: "claude", hosts: ["claude.ai"], aliases: ["claude", "anthropic"] },
    { name: "gemini", hosts: ["gemini.google.com", "bard.google.com"], aliases: ["gemini", "bard"] },
    { name: "copilot", hosts: ["copilot.microsoft.com"], aliases: ["copilot", "bing_chat", "bingchat"] },
    { name: "you", hosts: ["you.com"], aliases: ["you.com", "youchat"] },
    { name: "phind", hosts: ["phind.com"], aliases: ["phind"] },
    { name: "poe", hosts: ["poe.com"], aliases: ["poe"] },
    { name: "grok", hosts: ["grok.com", "x.ai"], aliases: ["grok", "xai"] },
    { name: "mistral", hosts: ["chat.mistral.ai", "mistral.ai"], aliases: ["mistral", "le_chat"] },
    { name: "meta_ai", hosts: ["meta.ai"], aliases: ["meta_ai", "metaai"] },
    { name: "deepseek", hosts: ["chat.deepseek.com", "deepseek.com"], aliases: ["deepseek"] }
  ];

  function uniqueList(value) {
    var source = [];
    if (Array.isArray(value)) source = value;
    else if (typeof value === "string") source = value.split(",");
    return source.map(function (item) { return String(item || "").trim(); }).filter(function (item, index, list) {
      return item && list.indexOf(item) === index;
    });
  }

  function storage(scope, method, key, value) {
    try {
      var store = scope === "session" ? window.sessionStorage : window.localStorage;
      if (value === undefined) return store[method](key);
      return store[method](key, value);
    } catch (error) {
      return null;
    }
  }

  function uuid(prefix) {
    var value = "";
    try {
      value = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : "";
    } catch (error) {}
    if (!value) value = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
    return prefix ? prefix + "_" + value : value;
  }

  function ensureId(scope, key, prefix) {
    var value = storage(scope, "getItem", key);
    if (value) return value;
    value = uuid(prefix);
    storage(scope, "setItem", key, value);
    return value;
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^|;)\\s*" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : "";
  }

  function setCookie(name, value, days) {
    if (!value) return;
    var maxAge = days * 24 * 60 * 60;
    document.cookie = name + "=" + encodeURIComponent(value) + "; Max-Age=" + maxAge + "; Path=/; SameSite=Lax; Secure";
  }

  function qs() {
    return new URLSearchParams(window.location.search);
  }

  function readJson(scope, key) {
    try {
      var value = storage(scope, "getItem", key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function firstTouch() {
    var saved = readJson("local", "ptr_first_touch");
    if (saved) return saved;
    saved = {
      landing_url: window.location.href,
      landing_path: window.location.pathname,
      referrer: document.referrer || "",
      first_seen_at: new Date().toISOString()
    };
    storage("local", "setItem", "ptr_first_touch", JSON.stringify(saved));
    return saved;
  }

  function attribution() {
    var params = qs();
    var data = {};
    ATTRIBUTION_KEYS.forEach(function (key) {
      var live = params.get(key);
      var saved = getCookie("trk_" + key) || storage("local", "getItem", "trk_" + key);
      if (live) {
        data[key] = live;
        setCookie("trk_" + key, live, 90);
        storage("local", "setItem", "trk_" + key, live);
      } else if (saved) {
        data[key] = saved;
      }
    });
    var fbp = getCookie("_fbp");
    if (fbp) data.fbp = fbp;
    var fbc = getCookie("_fbc");
    if (fbc) data.fbc = fbc;
    var first = firstTouch();
    data.landing_url = first.landing_url || "";
    data.landing_path = first.landing_path || "";
    data.first_referrer = first.referrer || "";
    data.first_seen_at = first.first_seen_at || "";
    return data;
  }

  function lower(value) {
    return String(value || "").toLowerCase();
  }

  function normalizeHost(value) {
    return lower(value).replace(/^www\./, "");
  }

  function referrerParts() {
    if (!document.referrer) return { host: "", path: "", query: "" };
    try {
      var url = new URL(document.referrer);
      return {
        host: normalizeHost(url.hostname),
        path: url.pathname || "",
        query: url.search || ""
      };
    } catch (error) {
      return { host: "", path: "", query: "" };
    }
  }

  function hostMatches(host, domain) {
    host = normalizeHost(host);
    domain = normalizeHost(domain);
    return host === domain || host.slice(-(domain.length + 1)) === "." + domain;
  }

  function sourceFromHost(host, map) {
    var found = "";
    Object.keys(map).some(function (domain) {
      if (hostMatches(host, domain)) {
        found = map[domain];
        return true;
      }
      return false;
    });
    return found;
  }

  function aiPlatformFrom(host, sourceText, referrerText) {
    var source = lower(sourceText);
    var ref = lower(referrerText);
    var matched = "";
    AI_PLATFORM_RULES.some(function (rule) {
      var hostMatch = rule.hosts.some(function (domain) { return hostMatches(host, domain); });
      var aliasMatch = rule.aliases.some(function (alias) {
        return source.indexOf(alias) !== -1 || ref.indexOf(alias) !== -1;
      });
      if (hostMatch || aliasMatch) {
        matched = rule.name;
        return true;
      }
      return false;
    });
    if (!matched && hostMatches(host, "bing.com") && /(chat|copilot|conversation|showconv)/.test(ref)) {
      matched = "copilot";
    }
    return matched;
  }

  function hasPaidClickId(data) {
    return !!(data.gclid || data.gbraid || data.wbraid || data.msclkid || data.fbclid || data.ttclid || data.li_fat_id);
  }

  function trafficSource() {
    var params = qs();
    var attr = attribution();
    var ref = referrerParts();
    var utmSource = lower(params.get("utm_source") || attr.utm_source || "");
    var utmMedium = lower(params.get("utm_medium") || attr.utm_medium || "");
    var utmCampaign = lower(params.get("utm_campaign") || attr.utm_campaign || "");
    var referrerHost = ref.host;
    var sourceText = [utmSource, utmMedium, utmCampaign].join(" ");
    var referrerText = [ref.path, ref.query].join(" ");
    var aiPlatform = aiPlatformFrom(referrerHost, sourceText, referrerText);
    var searchSource = sourceFromHost(referrerHost, SEARCH_ENGINES);
    var socialSource = sourceFromHost(referrerHost, SOCIAL_SOURCES);
    var sourceType = "direct";
    var sourceName = "direct";
    var detectedFrom = "none";

    if (aiPlatform) {
      sourceType = "ai_search";
      sourceName = aiPlatform;
      detectedFrom = referrerHost ? "referrer_or_utm" : "utm";
    } else if (hasPaidClickId(attr) || /(cpc|ppc|paid|paid_search|paid_social|display|retargeting)/.test(utmMedium)) {
      sourceType = /(social|facebook|instagram|tiktok|linkedin)/.test(utmMedium + " " + utmSource) ? "paid_social" : "paid_search";
      sourceName = utmSource || searchSource || socialSource || "paid";
      detectedFrom = hasPaidClickId(attr) ? "click_id" : "utm";
    } else if (searchSource) {
      sourceType = "organic_search";
      sourceName = searchSource;
      detectedFrom = "referrer";
    } else if (socialSource) {
      sourceType = "social";
      sourceName = socialSource;
      detectedFrom = "referrer";
    } else if (referrerHost && !hostMatches(referrerHost, SITE_DOMAIN)) {
      sourceType = "referral";
      sourceName = referrerHost;
      detectedFrom = "referrer";
    } else if (referrerHost && hostMatches(referrerHost, SITE_DOMAIN)) {
      sourceType = "internal";
      sourceName = SITE_DOMAIN;
      detectedFrom = "referrer";
    } else if (utmSource) {
      sourceType = "campaign";
      sourceName = utmSource;
      detectedFrom = "utm";
    }

    return {
      source_type: sourceType,
      source_name: sourceName,
      detected_from: detectedFrom,
      referrer_host: referrerHost,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      is_ai_search: sourceType === "ai_search",
      ai_platform: aiPlatform || ""
    };
  }

  function aiSearchContext(source) {
    if (!source || !source.is_ai_search) return null;
    return {
      platform: source.ai_platform,
      source_name: source.source_name,
      detected_from: source.detected_from,
      referrer_host: source.referrer_host,
      landing_path: window.location.pathname
    };
  }

  function classifyLink(anchor) {
    if (!anchor) return null;
    var explicit = anchor.getAttribute("data-track");
    var url;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch (error) {
      return null;
    }

    if (explicit) return explicit;
    if (url.protocol === "tel:") return "phone_call";
    if (url.protocol === "mailto:") return "email_click";
    if (url.hostname === "wa.me" || url.hostname.indexOf("whatsapp.com") !== -1) return "whatsapp_click";
    if (url.hostname.indexOf("typeform.com") !== -1) return "typeform_apply";
    if (url.hostname.indexOf("personaltrainersdubai.com") !== -1 && url.pathname.indexOf("/enquire") === 0) return "main_site_apply";
    if (url.hostname.indexOf("personaltrainersdubai.com") !== -1) return "main_site_click";
    return null;
  }

  function linkLocation(anchor) {
    return (
      anchor.getAttribute("data-track-location") ||
      anchor.closest("header, nav") && "nav" ||
      anchor.closest("footer") && "footer" ||
      anchor.closest(".final-cta") && "final-cta" ||
      anchor.closest(".hero") && "hero" ||
      anchor.closest(".proof") && "proof" ||
      "body"
    );
  }

  function destination(anchor) {
    var explicit = anchor.getAttribute("data-track-destination");
    if (explicit) return explicit;
    try {
      var url = new URL(anchor.href, window.location.href);
      if (url.protocol === "tel:") return "phone";
      if (url.protocol === "mailto:") return "email";
      if (url.hostname === "wa.me" || url.hostname.indexOf("whatsapp.com") !== -1) return "whatsapp";
      if (url.hostname.indexOf("typeform.com") !== -1) return "typeform";
      if (url.hostname.indexOf("personaltrainersdubai.com") !== -1) return "main-site";
      return url.hostname || "unknown";
    } catch (error) {
      return "unknown";
    }
  }

  function pageCampaign() {
    var canonical = document.querySelector('link[rel="canonical"]');
    var path = window.location.pathname.replace(/^\/|\/$/g, "") || "home";
    if (canonical) {
      try {
        path = new URL(canonical.href).pathname.replace(/^\/|\/$/g, "") || "home";
      } catch (error) {}
    }
    return path.replace(/\//g, "-");
  }

  function decorateLink(anchor, eventName) {
    if (!anchor || !anchor.href) return;
    var url;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch (error) {
      return;
    }

    if ((url.hostname === "wa.me" || url.hostname.indexOf("whatsapp.com") !== -1) && !url.searchParams.has("ptr_page")) {
      url.searchParams.set("ptr_page", window.location.pathname);
    }

    var isExternalConversion =
      url.hostname.indexOf("typeform.com") !== -1 ||
      url.hostname.indexOf("personaltrainersdubai.com") !== -1 ||
      url.hostname === "wa.me" ||
      url.hostname.indexOf("whatsapp.com") !== -1;

    if (!isExternalConversion || (url.protocol !== "http:" && url.protocol !== "https:")) return;

    var attr = attribution();
    var source = trafficSource();
    var clickLocation = anchor.getAttribute("data-track-location") || linkLocation(anchor);
    var clickLabel = anchor.getAttribute("data-track-label") || eventName || "conversion-click";

    function currentParam(key) {
      return lower(url.searchParams.get(key) || "");
    }

    function isSelfUtm(value) {
      return !value || value === SITE || value === SITE_PROPERTY || value === pageCampaign() || value === "resources" || value === "resource_hub" || value === "ptd_resources" || value === "ptr" || value === "organic" || value === "organic_search" || value === "organic_ai_search";
    }

    function setCampaignParam(key, value) {
      if (!value) return;
      var current = currentParam(key);
      if (!current || isSelfUtm(current) || current === "nav" || current === "hero" || current === "footer" || current === "body") {
        url.searchParams.set(key, value);
      }
    }

    setCampaignParam("utm_source", attr.utm_source || "resources");
    setCampaignParam("utm_medium", attr.utm_medium || (source.is_ai_search ? "organic_ai_search" : (source.source_type === "organic_search" ? "organic_search" : "organic")));
    setCampaignParam("utm_campaign", attr.utm_campaign || pageCampaign());
    if (!url.searchParams.has("utm_content")) url.searchParams.set("utm_content", clickLabel);

    ATTRIBUTION_KEYS.forEach(function (key) {
      if (attr[key] && !url.searchParams.has(key)) url.searchParams.set(key, attr[key]);
      if (attr[key] && !url.searchParams.has("ptr_" + key)) url.searchParams.set("ptr_" + key, attr[key]);
    });

    var cid = ensureId("local", "ptr_cid", "cid");
    if (!url.searchParams.has("ptr_cid")) url.searchParams.set("ptr_cid", cid);
    if (!url.searchParams.has("ptr_click_type")) url.searchParams.set("ptr_click_type", eventName || "conversion-click");
    if (!url.searchParams.has("ptr_click_location")) url.searchParams.set("ptr_click_location", clickLocation);
    if (!url.searchParams.has("ptr_click_label")) url.searchParams.set("ptr_click_label", clickLabel);
    if (!url.searchParams.has("ptr_source_type")) url.searchParams.set("ptr_source_type", source.source_type);
    if (!url.searchParams.has("ptr_source_name")) url.searchParams.set("ptr_source_name", source.source_name);
    if (source.ai_platform && !url.searchParams.has("ptr_ai_platform")) url.searchParams.set("ptr_ai_platform", source.ai_platform);
    anchor.href = url.toString();
  }

  function basePayload(eventName) {
    var source = trafficSource();
    return {
      event: eventName,
      event_name: eventName,
      event_id: uuid("evt"),
      site: SITE,
      site_property: SITE_PROPERTY,
      site_domain: SITE_DOMAIN,
      brand: BRAND,
      tracking_namespace: "ptr",
      client_id: ensureId("local", "ptr_cid", "cid"),
      session_id: ensureId("session", "ptr_sid", "sid"),
      page_url: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer || "",
      user_agent: navigator.userAgent,
      language: navigator.language || "",
      timestamp: new Date().toISOString(),
      attribution: attribution(),
      traffic_source: source,
      ai_search: aiSearchContext(source)
    };
  }

  function canonicalUrl() {
    var canonical = document.querySelector('link[rel="canonical"]');
    return canonical && canonical.href ? canonical.href : window.location.href;
  }

  function snowplowSchema(eventName) {
    if (eventName === "ptr_page_view") return "iglu:com.ptdfitness.ptr/page_view/jsonschema/1-0-0";
    if (eventName === "ptr_conversion_click") return "iglu:com.ptdfitness.ptr/conversion_click/jsonschema/1-0-0";
    if (eventName === LEAD_EVENT) return "iglu:com.ptdfitness.ptr/lead_intent/jsonschema/1-0-0";
    if (eventName === AI_REFERRAL_EVENT) return "iglu:com.ptdfitness.ptr/ai_referral/jsonschema/1-0-0";
    if (eventName === "ptr_form_submit") return "iglu:com.ptdfitness.ptr/form_submit/jsonschema/1-0-0";
    if (eventName.indexOf("ptr_video_") === 0) return "iglu:com.ptdfitness.ptr/video_engagement/jsonschema/1-0-0";
    if (eventName === "ptr_scroll_depth") return "iglu:com.ptdfitness.ptr/scroll_depth/jsonschema/1-0-0";
    if (eventName === "ptr_engaged_session") return "iglu:com.ptdfitness.ptr/engaged_session/jsonschema/1-0-0";
    return "iglu:com.ptdfitness.ptr/event/jsonschema/1-0-0";
  }

  function snowplowEnvelope(payload) {
    var contexts = [
      {
        schema: "iglu:com.ptdfitness.ptr/site_context/jsonschema/1-0-0",
        data: {
          site: SITE,
          site_property: SITE_PROPERTY,
          site_domain: SITE_DOMAIN,
          brand: BRAND,
          tracking_namespace: "ptr"
        }
      },
      {
        schema: "iglu:com.ptdfitness.ptr/page_context/jsonschema/1-0-0",
        data: {
          page_url: payload.page_url,
          page_path: payload.page_path,
          page_title: payload.page_title,
          canonical_url: canonicalUrl()
        }
      },
      {
        schema: "iglu:com.ptdfitness.ptr/traffic_source/jsonschema/1-0-0",
        data: payload.traffic_source || trafficSource()
      }
    ];

    if (payload.ai_search) {
      contexts.push({
        schema: "iglu:com.ptdfitness.ptr/ai_search_referrer/jsonschema/1-0-0",
        data: payload.ai_search
      });
    }

    if (payload.conversion) {
      contexts.push({
        schema: "iglu:com.ptdfitness.ptr/conversion_context/jsonschema/1-0-0",
        data: payload.conversion
      });
    }

    return {
      event_schema: snowplowSchema(payload.event_name),
      contexts: contexts
    };
  }

  function pushToDataLayer(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);

    if (typeof window.gtag === "function") {
      var gaParams = {
        event_id: payload.event_id,
        site: SITE,
        site_property: SITE_PROPERTY,
        traffic_source_type: payload.traffic_source && payload.traffic_source.source_type,
        traffic_source_name: payload.traffic_source && payload.traffic_source.source_name,
        ai_platform: payload.ai_search && payload.ai_search.platform,
        click_type: payload.click_type,
        click_location: payload.click_location,
        click_label: payload.click_label,
        destination: payload.destination,
        lead_type: payload.lead_type,
        conversion_type: payload.conversion_type,
        conversion_name: payload.conversion_name,
        value: payload.conversion_value,
        currency: payload.currency,
        page_path: payload.page_path,
        scroll_depth: payload.scroll_depth,
        video_percent: payload.video_percent
      };
      if (payload.event_name === LEAD_EVENT) {
        window.gtag("event", "generate_lead", gaParams);
        GA4_MEASUREMENT_IDS.forEach(function (measurementId) {
          window.gtag("event", "generate_lead", Object.assign({}, gaParams, { send_to: measurementId }));
        });
      }
      window.gtag("event", payload.event_name, gaParams);
      GA4_MEASUREMENT_IDS.forEach(function (measurementId) {
        window.gtag("event", payload.event_name, Object.assign({}, gaParams, { send_to: measurementId }));
      });
    }

    if (typeof window.fbq === "function") {
      if (SEND_TO_EXISTING_META) {
        var existingEventName = metaEventName(payload);
        if (payload.event_name === LEAD_EVENT && SEND_STANDARD_LEAD_TO_EXISTING_META) {
          window.fbq("track", META_CONFIG.standardLeadEvent || "Lead", metaPayload(payload), { eventID: payload.event_id });
        }
        if (existingEventName) {
          window.fbq("trackCustom", existingEventName, metaPayload(payload), { eventID: payload.event_id });
        }
      }
      pushDedicatedMeta(payload);
    }

    if (window.zaraz && typeof window.zaraz.track === "function") {
      window.zaraz.track(payload.event_name, payload);
    }
  }

  function storePayload(payload) {
    try {
      var key = "ptr_tracking_events";
      var current = JSON.parse(window.localStorage.getItem(key) || "[]");
      current.push(payload);
      window.localStorage.setItem(key, JSON.stringify(current.slice(-100)));
    } catch (error) {}
  }

  function sendBeacon(payload) {
    if (!API_ROUTE) return;
    var body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(API_ROUTE, blob)) return;
      } catch (error) {}
    }

    try {
      window.fetch(API_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        credentials: "same-origin",
        keepalive: true
      }).catch(function () {});
    } catch (error) {}
  }

  function track(payload) {
    if (!payload.snowplow) payload.snowplow = snowplowEnvelope(payload);
    pushToDataLayer(payload);
    storePayload(payload);
    sendBeacon(payload);
  }

  function metaEventName(payload) {
    if (payload.event_name === "ptr_page_view") return META_CONFIG.pageViewEvent || "PTDRPageView";
    if (payload.event_name === "ptr_conversion_click") return META_CONFIG.conversionEvent || "PTDRConversionClick";
    if (payload.event_name === LEAD_EVENT) return META_CONFIG.leadCustomEvent || "PTDRLead";
    if (payload.event_name === AI_REFERRAL_EVENT) return META_CONFIG.aiReferralCustomEvent || "PTDRAIReferral";
    if (payload.event_name === "ptr_scroll_depth") return META_CONFIG.scrollEvent || "PTDRScrollDepth";
    if (payload.event_name.indexOf("ptr_video_") === 0) return META_CONFIG.videoEvent || "PTDRVideoEngagement";
    if (payload.event_name === "ptr_form_submit") return META_CONFIG.formEvent || "PTDRFormSubmit";
    if (payload.event_name === "ptr_engaged_session") return META_CONFIG.engagedEvent || "PTDREngagedSession";
    return "";
  }

  function metaPayload(payload) {
    return {
      event_id: payload.event_id,
      site: SITE,
      site_property: SITE_PROPERTY,
      content_category: SITE_PROPERTY,
      traffic_source_type: payload.traffic_source && payload.traffic_source.source_type,
      traffic_source_name: payload.traffic_source && payload.traffic_source.source_name,
      ai_platform: payload.ai_search && payload.ai_search.platform,
      page_path: payload.page_path,
      page_title: payload.page_title,
      click_type: payload.click_type,
      click_location: payload.click_location,
      click_label: payload.click_label,
      destination: payload.destination,
      lead_type: payload.lead_type,
      conversion_type: payload.conversion_type,
      conversion_name: payload.conversion_name,
      value: payload.conversion_value,
      currency: payload.currency,
      scroll_depth: payload.scroll_depth,
      video_id: payload.video_id,
      video_title: payload.video_title,
      video_percent: payload.video_percent,
      engagement_seconds: payload.engagement_seconds
    };
  }

  function pushDedicatedMeta(payload) {
    if (!META_PIXEL_IDS.length || typeof window.fbq !== "function") return;
    var customName = metaEventName(payload);
    var params = metaPayload(payload);
    META_PIXEL_IDS.forEach(function (pixelId) {
      if (payload.event_name === "ptr_page_view") {
        window.fbq("trackSingle", pixelId, "PageView", params, { eventID: payload.event_id });
      }
      if (payload.event_name === LEAD_EVENT) {
        window.fbq("trackSingle", pixelId, META_CONFIG.standardLeadEvent || "Lead", params, { eventID: payload.event_id });
        if (customName) {
          window.fbq("trackSingleCustom", pixelId, customName, params, { eventID: payload.event_id });
        }
        return;
      }
      if (customName) {
        window.fbq("trackSingleCustom", pixelId, customName, params, { eventID: payload.event_id });
      }
    });
  }

  function trackPageView() {
    var payload = basePayload("ptr_page_view");
    payload.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    track(payload);
  }

  function isLeadIntent(eventName) {
    return !!LEAD_TYPES[eventName];
  }

  function leadValue(eventName) {
    var value = Number(LEAD_VALUES[eventName]);
    return Number.isFinite(value) ? value : 0;
  }

  function trackLeadIntent(anchor, eventName, sourcePayload) {
    var payload = basePayload(LEAD_EVENT);
    var label = anchor && anchor.textContent ? anchor.textContent.trim().replace(/\s+/g, " ").slice(0, 120) : "";
    payload.click_type = eventName;
    payload.click_location = anchor ? linkLocation(anchor) : "body";
    payload.click_label = anchor && anchor.getAttribute("data-track-label") || label || LEAD_NAMES[eventName] || eventName;
    payload.destination = anchor ? destination(anchor) : "onsite";
    payload.href = anchor && anchor.href || "";
    payload.lead_type = LEAD_TYPES[eventName] || eventName;
    payload.conversion_type = "lead_intent";
    payload.conversion_name = LEAD_NAMES[eventName] || eventName;
    payload.conversion_value = leadValue(eventName);
    payload.currency = CURRENCY;
    payload.conversion = {
      type: payload.conversion_type,
      name: payload.conversion_name,
      lead_type: payload.lead_type,
      value: payload.conversion_value,
      currency: payload.currency,
      source_event_id: sourcePayload && sourcePayload.event_id || ""
    };
    track(payload);
  }

  function trackAiReferral() {
    var source = trafficSource();
    if (!source.is_ai_search) return;
    var key = "ptr_ai_referral_" + source.source_name + "_" + window.location.pathname;
    if (storage("session", "getItem", key)) return;
    storage("session", "setItem", key, "1");
    var payload = basePayload(AI_REFERRAL_EVENT);
    payload.traffic_source = source;
    payload.ai_search = aiSearchContext(source);
    payload.ai_platform = source.ai_platform;
    track(payload);
  }

  function trackClick(anchor, eventName) {
    decorateLink(anchor, eventName);
    var payload = basePayload("ptr_conversion_click");
    payload.click_type = eventName;
    payload.click_location = linkLocation(anchor);
    payload.click_label = anchor.getAttribute("data-track-label") || anchor.textContent.trim().replace(/\s+/g, " ").slice(0, 120);
    payload.destination = destination(anchor);
    payload.href = anchor.href;
    track(payload);
    if (isLeadIntent(eventName)) trackLeadIntent(anchor, eventName, payload);
  }

  function trackFormSubmit(form) {
    var payload = basePayload("ptr_form_submit");
    payload.form_id = form.getAttribute("id") || "";
    payload.form_name = form.getAttribute("name") || "";
    payload.click_location = linkLocation(form);
    track(payload);
    trackLeadIntent(null, "onsite_form_submit", payload);
  }

  function trackScrollDepth() {
    var fired = {};
    var thresholds = [25, 50, 75, 90];
    var ticking = false;

    function check() {
      ticking = false;
      var doc = document.documentElement;
      var body = document.body || {};
      var scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
      var height = Math.max(body.scrollHeight || 0, doc.scrollHeight || 0) - window.innerHeight;
      if (height <= 0) return;
      var depth = Math.min(100, Math.round((scrollTop / height) * 100));
      thresholds.forEach(function (threshold) {
        if (depth >= threshold && !fired[threshold]) {
          fired[threshold] = true;
          var payload = basePayload("ptr_scroll_depth");
          payload.scroll_depth = threshold;
          track(payload);
        }
      });
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(check);
    }, { passive: true });
    check();
  }

  function bindVideos() {
    document.querySelectorAll("video").forEach(function (video, index) {
      var started = false;
      var firedProgress = {};
      var videoId = video.getAttribute("id") || video.getAttribute("data-video-id") || "video-" + (index + 1);
      var videoTitle = video.getAttribute("title") || video.getAttribute("aria-label") || video.getAttribute("data-track-label") || videoId;

      function videoPayload(eventName, percent) {
        var payload = basePayload(eventName);
        payload.video_id = videoId;
        payload.video_title = videoTitle;
        payload.video_percent = percent || 0;
        payload.video_current_time = Math.round(video.currentTime || 0);
        payload.video_duration = Math.round(video.duration || 0);
        return payload;
      }

      video.addEventListener("play", function () {
        if (started) return;
        started = true;
        track(videoPayload("ptr_video_start", 0));
      });

      video.addEventListener("timeupdate", function () {
        if (!video.duration || !isFinite(video.duration)) return;
        var percent = Math.floor((video.currentTime / video.duration) * 100);
        [25, 50, 75].forEach(function (threshold) {
          if (percent >= threshold && !firedProgress[threshold]) {
            firedProgress[threshold] = true;
            track(videoPayload("ptr_video_progress", threshold));
          }
        });
      });

      video.addEventListener("ended", function () {
        track(videoPayload("ptr_video_complete", 100));
      });
    });
  }

  function trackEngagedSession() {
    window.setTimeout(function () {
      var payload = basePayload("ptr_engaged_session");
      payload.engagement_seconds = 10;
      track(payload);
    }, 10000);
  }

  function bindLinks() {
    document.querySelectorAll("a").forEach(function (anchor) {
      var eventName = classifyLink(anchor);
      if (eventName) decorateLink(anchor, eventName);
    });

    document.addEventListener("click", function (event) {
      var anchor = event.target.closest("a");
      if (!anchor) return;
      var eventName = classifyLink(anchor);
      if (!eventName) return;
      trackClick(anchor, eventName);
    }, true);

    document.addEventListener("submit", function (event) {
      if (event.target && event.target.tagName === "FORM") trackFormSubmit(event.target);
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindLinks();
      bindVideos();
      trackScrollDepth();
      trackEngagedSession();
      trackAiReferral();
      trackPageView();
    });
  } else {
    bindLinks();
    bindVideos();
    trackScrollDepth();
    trackEngagedSession();
    trackAiReferral();
    trackPageView();
  }
})();
