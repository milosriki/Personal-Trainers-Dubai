window.PTDR_TRACKING_CONFIG = {
  site: "ptd_resources",
  siteProperty: "ptd_resource_hub",
  siteDomain: "resources.personaltrainersdubai.com",
  brand: "PTD Fitness",
  eventPrefix: "ptr",
  cookieDays: 90,
  // GitHub Pages has no local function endpoint. Keep this blank until a Snowplow/server-side forwarder is configured.
  // If configured later, every event already carries a Snowplow-compatible envelope.
  eventEndpoint: "",
  meta: {
    pixelIds: [],
    sendCustomEventsToExistingPixels: true,
    sendStandardLeadToExistingPixels: false,
    pageViewEvent: "PTDRPageView",
    conversionEvent: "PTDRConversionClick",
    leadCustomEvent: "PTDRLead",
    standardLeadEvent: "Lead",
    aiReferralCustomEvent: "PTDRAIReferral",
    scrollEvent: "PTDRScrollDepth",
    videoEvent: "PTDRVideoEngagement",
    formEvent: "PTDRFormSubmit",
    engagedEvent: "PTDREngagedSession"
  },
  conversion: {
    leadEvent: "ptr_lead",
    aiReferralEvent: "ptr_ai_referral",
    currency: "AED",
    leadValues: {
      typeform_apply: 150,
      main_site_apply: 150,
      whatsapp_click: 120,
      phone_call: 120,
      email_click: 50,
      onsite_form_submit: 150
    },
    leadTypes: {
      typeform_apply: "resource_typeform_application_intent",
      main_site_apply: "resource_main_site_application_intent",
      whatsapp_click: "resource_whatsapp_lead_intent",
      phone_call: "resource_phone_lead_intent",
      email_click: "resource_email_contact_intent",
      onsite_form_submit: "resource_onsite_form_submit"
    },
    leadNames: {
      typeform_apply: "Resource hub Typeform application click",
      main_site_apply: "Resource hub main PTD application click",
      whatsapp_click: "Resource hub WhatsApp consultation click",
      phone_call: "Resource hub phone call click",
      email_click: "Resource hub email contact click",
      onsite_form_submit: "Resource hub on-site form submit"
    }
  },
  analytics: {
    ga4MeasurementIds: []
  }
};
