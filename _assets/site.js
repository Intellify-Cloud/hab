$(function () {
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').on("click", function () {
        if (location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") && location.hostname == this.hostname) {
            var a = $(this.hash);
            if ((a = a.length ? a : $("[name=" + this.hash.slice(1) + "]")).length) return $("html, body").animate({
                scrollTop: a.offset().top - 54
            }, 1e3, "easeInOutExpo"), !1
        }
    });

    $(".js-scroll-trigger").on("click", function () {
        $(".navbar-collapse").collapse("hide")
    });

    $("body").scrollspy({
        target: "#mainNav",
        offset: 56
    });

    $(window).on("scroll", function () {
        return 100 < $("#mainNav").offset().top ? $("#mainNav").addClass("navbar-shrink") : $("#mainNav").removeClass("navbar-shrink");
    });

    function getFacebookConfig() {
        return window.habFacebookConfig || {};
    }

    function getConsent() {
        try {
            return window.localStorage.getItem("hab-facebook-consent");
        } catch (error) {
            return null;
        }
    }

    function setConsent(value) {
        try {
            window.localStorage.setItem("hab-facebook-consent", value);
        } catch (error) {}
    }

    function getBanner() {
        return document.getElementById("facebook-consent-banner");
    }

    function setBannerVisible(visible) {
        var banner = getBanner();
        if (!banner) {
            return;
        }

        banner.classList.toggle("d-none", !visible);
        document.body.classList.toggle("has-facebook-consent-banner", visible);
    }

    function ensureFacebookPixel() {
        var config = getFacebookConfig();
        if (!config.pixelId || window.fbq) {
            if (window.fbq) {
                window.fbq("track", "PageView");
            }
            return;
        }

        var fbq = window.fbq = function () {
            fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
        };

        if (!window._fbq) {
            window._fbq = fbq;
        }

        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = "2.0";
        fbq.queue = [];
        fbq("init", config.pixelId);
        fbq("track", "PageView");

        var script = document.createElement("script");
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(script);
    }

    function ensureFacebookChat() {
        var config = getFacebookConfig();
        if (!config.pageId || !config.appId || document.getElementById("facebook-jssdk")) {
            return;
        }

        var chat = document.createElement("div");
        chat.className = "fb-customerchat";
        chat.setAttribute("page_id", config.pageId);
        chat.setAttribute("ref", "");
        document.body.appendChild(chat);

        window.fbMessengerPlugins = window.fbMessengerPlugins || {
            init: function () {
                if (!window.FB) {
                    return;
                }

                FB.init({
                    appId: config.appId,
                    autoLogAppEvents: true,
                    xfbml: true,
                    version: "v8.0"
                });
            },
            callable: []
        };

        window.fbAsyncInit = window.fbAsyncInit || function () {
            window.fbMessengerPlugins.callable.forEach(function (item) {
                item();
            });
            window.fbMessengerPlugins.init();
        };

        var script = document.createElement("script");
        script.id = "facebook-jssdk";
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js";
        document.body.appendChild(script);
    }

    function enableFacebookIntegrations() {
        ensureFacebookPixel();
        ensureFacebookChat();
    }

    function bindConsentButtons() {
        $(document).on("click", "[data-facebook-consent]", function () {
            var action = $(this).data("facebook-consent");
            if (action === "accept") {
                setConsent("accepted");
                setBannerVisible(false);
                enableFacebookIntegrations();
            } else {
                setConsent("declined");
                setBannerVisible(false);
            }
        });
    }

    function initFacebookConsent() {
        var config = getFacebookConfig();
        if (!config.pixelId || !config.pageId || !config.appId) {
            return;
        }

        bindConsentButtons();

        if (getConsent() === "accepted") {
            enableFacebookIntegrations();
            setBannerVisible(false);
            return;
        }

        setBannerVisible(true);
    }

    initFacebookConsent();
});

