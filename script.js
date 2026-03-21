// --- ?„ì—­ ?¤ì • ë°??íƒœ ê´€ë¦?---
const DEFAULT_MASTER_URL = "https://script.google.com/macros/s/AKfycbw_wP7aQlfrUVyEZlORObmrQghbRBMz3qpmz7aMj18jTc4WkuZhRVlp2kFfYxPWH3jFmQ/exec";
// ì¤‘ìš”: ë³¸ì¸??Apps Script ë°°í¬ URLë¡?êµì²´ ?„ìš” (?¤ì • ë©”ë‰´?ì„œ ?…ë ¥ ê¶Œì¥)
const DEFAULT_TEST_ROOT_URL = "https://drive.google.com/drive/folders/18dd5Gssjlw9jGZJHmES91HWNxKVqD32A";

// ë¡œì»¬ ?¤í† ë¦¬ì? ??
const STORAGE_KEY = "YONSEI_PREMIUM_CONFIG_V2";

// ?„ì—­ ?íƒœ ë³€??
let authMode = 'initial'; // initial, student, admin, master
let curCatId = "";
let examSession = {
    studentName: "",
    grade: "",
    categoryId: "",
    date: "",
    answers: {}, // { qId: answerVal }
    startTime: null,
    isExamActive: false
};
let examTimer = null;
let fData1 = null;
let fData2 = null;

// ë¬¸ì œ ? í˜•/?ì—­ ?ìˆ˜
const SECTIONS = ["Grammar", "Writing", "Reading", "Listening", "Vocabulary"];
const SUB_TYPE_MAP = {
    "Grammar": ["ê°€?•ë²•", "ê´€ê³„ë?ëª…ì‚¬", "ê´€ê³„ë???, "ê´€ê³„ì‚¬", "ê´€ê³„ì‚¬/?˜ë¬¸??, "ê´€ê³„ì‚¬/?‘ì†??, "?€ëª…ì‚¬", "ëª…ì‚¬", "ë³‘ë ¬ êµ¬ì¡°", "ë¶„ì‚¬", "ë¶„ì‚¬êµ¬ë¬¸", "ë¹„êµê¸?, "?˜ë™??, "?˜ì¼ì¹?, "?œì œ", "?¼ì¹˜/?”ë²•", "?‘ì†??, "ì¡°ë™??, "ì¤€?™ì‚¬", "ì§€ì¹?ë³µí•©", "?¹ìˆ˜êµ¬ë¬¸", "?•ì‹", "?•ìš©??, "?•ìš©??ë¶€??, "?”ë²•", "toë¶€?•ì‚¬", "toë¶€?•ì‚¬/?™ëª…??, "ê¸°í?"],
    "Writing": ["?ˆë²¨1", "?ˆë²¨2", "?ˆë²¨3", "?ˆë²¨4", "?ˆë²¨5", "?ˆë²¨6", "?ˆë²¨7", "?ˆë²¨8", "?ˆë²¨9", "ë¬¸ì¥ ?„ì„±", "ê¸€ ?”ì•½", "?‘ë¬¸", "ê¸°í?"],
    "Reading": ["ê¸€ ?”ì•½", "?´ìš© ?¼ì¹˜", "?€???Œì•…", "ëª©ì ", "ë¬¸ì¥ ?°ê²°??, "ë¬¸ì¥ ?„ì„±", "ë¬¸ì¥ ?˜ë?", "ë°‘ì¤„ ì¶”ë¡ ", "?¬ë¦¬/?¬ê²½", "ë¹ˆì¹¸ì¶”ë¡ ", "?½ì…", "?¸ë??¬í•­", "?œì„œ", "?´íœ˜ ì¶”ë¡ ", "?´íœ˜ ?œìš©", "?°ê²°??, "?”ì•½/?”ì?", "?¥ë¬¸ ë¹ˆì¹¸", "?¥ë¬¸ ?œëª©", "?œëª©", "ì£¼ì œ", "ì§€ì¹?, "ì¶”ë¡ ", "?ë¦„", "ê¸°í?"],
    "Listening": ["ê³„ì‚°", "ê·¸ë¦¼ ë¬˜ì‚¬", "ëª©ì  ?Œì•…", "ë¬˜ì‚¬", "ë°›ì•„?°ê¸°", "?í™©?Œì•…", "?¸ë??¬í•­", "?¬ë¦¬/?¬ê²½", "?‘ë‹µ", "?•ë³´ ?”ì•½", "ì£¼ì œ", "?¨ì–´ ?…ë ¥", "ê¸°í?"],
    "Vocabulary": ["?ˆë²¨1", "?ˆë²¨2", "?ˆë²¨3", "?ˆë²¨4", "?ˆë²¨5", "?ˆë²¨6", "?ˆë²¨7", "?ˆë²¨8", "?ˆë²¨9", "?™ì–´", "ê¸°í?"]
};

// ê¸°ë³¸ ?¤ì • ê°ì²´ (ë¡œì»¬ ?¤í† ë¦¬ì? ?†ì„ ???¬ìš©)
let globalConfig = {
    adminCode: "1111", // ì´ˆê¸° ê´€ë¦¬ì ë¹„ë²ˆ
    masterCode: "0000", // [New] ë§ˆìŠ¤??ë¹„ë²ˆ
    masterUrl: "https://script.google.com/macros/s/AKfycbw_wP7aQlfrUVyEZlORObmrQghbRBMz3qpmz7aMj18jTc4WkuZhRVlp2kFfYxPWH3jFmQ/exec",
    mainServerLink: "https://drive.google.com/drive/folders/18dd5Gssjlw9jGZJHmES91HWNxKVqD32A", // [New] ?°ì„¸êµ? œ ?¤ì •ë§í¬ ì¤‘ì•™ê´€ë¦??œíŠ¸ ?°ë™ ë§í¬
    geminiKey: "", // AI API Key
    categories: [], // { id, name, createdDate, targetFolderUrl }
    questions: [], // ë¡œì»¬ ìºì‹±??ë¬¸í•­ ë¦¬ìŠ¤??
    classes: [], // ?±ë¡ ?™ê¸‰ ëª©ë¡ ?? ["ì¤?Aë°?, "ì¤?Bë°?]
    logo: "https://drive.google.com/thumbnail?id=1-w2OQx2-M504_S7eEis0hF6nljhP3HwM&sz=w1000", // [Refactor] Flattened from assets
    banner: "https://drive.google.com/thumbnail?id=1-v3M4W_A3f5B-p9L75Bw3H5Z5kI7lJbX&sz=w1000", // [Refactor] Flattened from assets
};

// --- ì´ˆê¸°??ë°?ë¡œì»¬ ?€?¥ì†Œ ?¨ìˆ˜ ---
function load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            const parsed = JSON.parse(data);
            // ë³‘í•© ë¡œì§ (?ˆë¡œ???„ë“œê°€ ?ê¸¸ ???ˆìœ¼ë¯€ë¡?
            globalConfig = { ...globalConfig, ...parsed };
            // ì¤‘ì²© ê°ì²´ ë³‘í•© ë³´ì •
            if (parsed.assets) {
                // [Migration] êµ¬ë²„??assets ê°ì²´ê°€ ?ˆë‹¤ë©??‰íƒ„?”í•˜??ë³µêµ¬
                if (parsed.assets.logo) globalConfig.logo = parsed.assets.logo;
                if (parsed.assets.banner) globalConfig.banner = parsed.assets.banner;
            }
        } catch (e) {
            console.error("Local Load Error", e);
        }
    }
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalConfig));
}

// ì´ˆê¸° ë¡œë“œ ?¤í–‰
load();

// --- ë¡œë”© ?¸ë””ì¼€?´í„° ?œì–´ ---
function toggleLoading(show) {
    const el = document.getElementById("loading-overlay");
    if (el) el.style.display = show ? "flex" : "none";
}

// --- ?´ë¼?°ë“œ ?™ê¸°??(?¤ì •ê°’ë§Œ) ---
async function saveConfigToCloud(silent = false) {
    if (!globalConfig.masterUrl) return; // URL ?†ìœ¼ë©??¤í‚µ

    // ?„ìˆ˜ ?°ì´?°ë§Œ ?„ì†¡ (questions??ë³„ë„ ê´€ë¦¬ë˜ë¯€ë¡??œì™¸?˜ê±°???¬í•¨ ?¬ë? ê²°ì •)
    // ?¬ê¸°?œëŠ” ?¤ì •ê°?ì¹´í…Œê³ ë¦¬, ë¹„ë²ˆ, ?ì‚°ì£¼ì†Œ ??ë§?ë°±ì—…
    const configToSave = {
        adminCode: globalConfig.adminCode,
        masterCode: globalConfig.masterCode, // [ì¶”ê?] Master Code ?€??
        masterUrl: globalConfig.masterUrl, // [ì¶”ê?] Master Sync API URL ?€??
        mainServerLink: globalConfig.mainServerLink, // [New] ë©”ì¸ ?œë²„ ë§í¬ ?™ê¸°??
        geminiKey: globalConfig.geminiKey,
        categories: JSON.stringify(globalConfig.categories),
        questions: '[]', // Don't upload questions directly to unified config
        logo: globalConfig.logo,
        banner: globalConfig.banner,
        classes: JSON.stringify(globalConfig.classes || []),
    };

    if (!silent) toggleLoading(true);
    try {
        // [Single Root Policy] ëª¨ë“  ?°ì´?°ëŠ” mainServerLink(ë©”ì¸ ?´ë”) ?˜ìœ„???€??
        // mainServerLink ?ì²´ê°€ ?´ë” ë§í¬?¬ì•¼ ??
        const rootId = extractFolderId(globalConfig.mainServerLink);
        if (!rootId && !silent) {
            showToast("? ï¸ ë©”ì¸ ?œë²„ ?´ë” ì£¼ì†Œê°€ ?¤ì •?˜ì? ?Šì•˜?µë‹ˆ??");
            return;
        }

        const response = await fetch(globalConfig.masterUrl, {
            method: "POST",
            body: JSON.stringify({
                type: "SAVE_CONFIG",
                parentFolderId: rootId, // [Modified] ëª…ì‹œ???´ë” ì§€??
                // Single Root Policy: assetFolderId???´ì œ ë³„ë„ë¡?ë³´ë‚´ì§€ ?Šê±°??rootId?€ ?™ì¼?˜ê²Œ ì·¨ê¸‰
                config: configToSave
            })
        });

        const text = await response.text();
        let json = {};
        try {
            json = JSON.parse(text);
        } catch (e) {
            console.warn("Response Parse Error", text);
        }

        if (json.status === "Success") {
            if (!silent) showToast("?ï¸ ?¤ì •???´ë¼?°ë“œ??ë°±ì—…?˜ì—ˆ?µë‹ˆ?? (?Œì¼ ?ì„±/ê°±ì‹  ?„ë£Œ)");
        } else {
            console.error("Cloud Save Error:", json);
            if (!silent) showToast(`??ë°±ì—… ?¤íŒ¨: ${json.message || "?œë²„ ?‘ë‹µ ?¤ë¥˜"}`);
        }
    } catch (e) {
        console.warn("Cloud Save Failed", e);
        if (!silent) showToast("? ï¸ ?´ë¼?°ë“œ ë°±ì—… ?¤íŒ¨ (?¤íŠ¸?Œí¬ ?•ì¸)");
    } finally {
        if (!silent) toggleLoading(false);
    }
}

async function loadConfigFromCloud(silent = false) {
    if (!globalConfig.masterUrl) {
        console.error("Load Config Failed: No Master URL");
        if (!silent) showToast("? ï¸ Master URL???†ìŠµ?ˆë‹¤.");
        return false;
    }

    if (!silent) toggleLoading(true);
    try {
        // [Single Root Policy] ë©”ì¸ ?œë²„ ?´ë”?ì„œ ?¤ì • ë¡œë“œ
        const rootId = extractFolderId(globalConfig.mainServerLink);
        if (!rootId) {
            if (!silent) showToast("? ï¸ ë©”ì¸ ?œë²„ ?´ë” ?¤ì •??ë¨¼ì? ?´ì£¼?¸ìš”.");
            return false;
        }



        console.log(`?“¡ Fetching Config... Root: ${rootId}, URL: ${globalConfig.masterUrl}`);
        // showToast(`?“¡ Loading... (${rootId ? 'Folder Set' : 'No Folder'})`);

        const res = await fetch(globalConfig.masterUrl, {
            method: "POST",
            body: JSON.stringify({
                type: "GET_CONFIG",
                parentFolderId: rootId
            })
        });

        const text = await res.text();
        console.log("?“¡ Raw Response:", text);

        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error", e);
            if (!silent) showToast("? ï¸ ?œë²„ ?‘ë‹µ ?•ì‹???¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤.");
            return false;
        }

        if (json.status === "Success" && json.config) {
            console.log("??Config Loaded:", json.config);
            const c = json.config;
            if (c.adminCode) globalConfig.adminCode = c.adminCode;
            if (c.masterCode) globalConfig.masterCode = c.masterCode;
            // masterUrl?€ ??–´?°ì? ?ŠìŒ (?„ì¬ ?°ê²°??URL??ê¸°ì??´ë?ë¡?
            if (c.mainServerLink) globalConfig.mainServerLink = c.mainServerLink; // [New] Load Main Server Link
            if (c.geminiKey) globalConfig.geminiKey = c.geminiKey;

            if (c.categories) {
                try { globalConfig.categories = typeof c.categories === 'string' ? JSON.parse(c.categories) : c.categories; } catch (e) { console.warn("Categories Parse Error", e); }
            }
            if (c.logo) globalConfig.logo = c.logo;
            if (c.banner) globalConfig.banner = c.banner;
            if (c.classes) {
                try { globalConfig.classes = typeof c.classes === 'string' ? JSON.parse(c.classes) : c.classes; } catch(e) { console.warn('Classes Parse Error', e); }
            }

            // [Fix] ë¬¸í•­ ?°ì´??ë¡œë“œ ì¶”ê? (?°ì´???„ë½ ë°©ì?)
            if (c.questions) {
                try {
                    const qData = typeof c.questions === 'string' ? JSON.parse(c.questions) : c.questions;
                    if (Array.isArray(qData)) {
                        globalConfig.questions = qData;
                        console.log(`??Loaded ${qData.length} questions from Config`);
                    }
                } catch (e) { console.warn("Questions Parse Error", e); }
            }

            save(); // ë¡œì»¬ ë°˜ì˜
            if (!silent) showToast("?ï¸ ?¤ì • ?™ê¸°???„ë£Œ! (?”ë©´ ê°±ì‹ ??");
            // [Fix] ì¤‘ìš”: ?¤ì • ë¡œë“œ ??ì¦‰ì‹œ ?”ë©´ ê°±ì‹  ?¸ë¦¬ê±?
            applyBranding();
            return true;
        } else {
            console.warn("Server Error:", json);
            if (!silent) showToast(`? ï¸ ?œë²„ ?¤ë¥˜: ${json.message || "?¤ì • ?†ìŒ"}`);
            return false;
        }
    } catch (e) {
        console.warn("Cloud Load Failed", e);
        if (!silent) showToast("? ï¸ ?¤íŠ¸?Œí¬/?œë²„ ?µì‹  ?¤íŒ¨");
        return false;
    } finally {
        if (!silent) toggleLoading(false);
    }
}

// --- ? í‹¸ë¦¬í‹° ?¨ìˆ˜ ---
function setCanvasId(id, layoutMode = 'standard') {
    const c = document.getElementById('dynamic-content');
    if (c) c.setAttribute('data-canvas-id', id);

    // [New] ?ˆì´?„ì›ƒ ëª¨ë“œ ?œì–´ (Scroll Fix)
    const parentCanvas = document.getElementById('app-canvas');
    if (parentCanvas) {
        if (layoutMode === 'full') {
            // ?„ì²´ ?”ë©´ ëª¨ë“œ: ë¶€ëª??¨ë”©/?¤í¬ë¡??œê±° -> ?ì‹???¤í¬ë¡??„ë‹´
            parentCanvas.classList.add('!p-0', '!overflow-hidden');
        } else {
            // ê¸°ë³¸ ëª¨ë“œ: ë¶€ëª??¨ë”©/?¤í¬ë¡?ë³µì›
            parentCanvas.classList.remove('!p-0', '!overflow-hidden');
            parentCanvas.style.removeProperty('padding');
            parentCanvas.style.removeProperty('overflow');
        }
    }
}

// [Emergency Fix] Force Toast Visibility - Absolute Centering
function showToast(m) {
    const el = document.getElementById("toast");
    if (el) {
        // 1. Reset Content & Base Style
        el.textContent = m;

        // 2. Force Visible State with CSS Centering (No Transform for X)
        el.style.position = 'fixed';
        el.style.left = '0';
        el.style.right = '0';
        el.style.margin = '0 auto'; // Magic Centering
        el.style.width = 'fit-content';
        el.style.textAlign = 'center';
        el.style.bottom = '40px';

        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)'; // Reset Y only
        el.style.zIndex = '99999999';

        // 3. Remove Hidden Class (Safety)
        el.classList.remove("hidden", "opacity-0", "translate-y-20");

        // 4. Set Timeout to Hide
        if (el.hideTimeout) clearTimeout(el.hideTimeout);
        el.hideTimeout = setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)'; // Slide down Y only
            setTimeout(() => {
                el.style.display = 'none';
            }, 300);
        }, 3000);
    } else {
        alert(m); // Fallback
    }
}

// [Utility] Standardized Empty State Renderer
function renderEmptyState(c, title) {
    c.innerHTML = `
        <div class="animate-fade-in-safe space-y-12 pb-20 mt-5">
            <h2 class="fs-32 text-[#013976] underline decoration-slate-200 decoration-8 underline-offset-8 leading-none font-black uppercase !border-none !pb-0">${title}</h2>
            
            <div class="card !bg-white border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center p-20 space-y-6">
                <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-6xl shadow-inner mb-2">?“­</div>
                <div class="text-center space-y-2">
                    <h3 class="fs-24 text-slate-600 font-bold uppercase">No Category Found</h3>
                    <p class="fs-17-reg text-slate-400 leading-relaxed">?±ë¡??ì¹´í…Œê³ ë¦¬(?œí—˜ì§€)ê°€ ?†ìŠµ?ˆë‹¤.<br>ë¨¼ì? ì¹´í…Œê³ ë¦¬(?œí—˜ì§€)ë¥??ì„±??ì£¼ì„¸??</p>
                </div>
            </div>
        </div>
    `;
}


// [ì¤‘ìš”] ?ˆë? ?¤íŒ¨?˜ì? ?ŠëŠ” ?€?¥ì†Œ: ?¬ì‹œ??ë¡œì§ ê°•í™” (ìµœë? 10??
async function sendReliableRequest(payload, silent = false) {
    console.log("?? sendReliableRequest started", payload);

    const masterUrl = globalConfig.masterUrl || DEFAULT_MASTER_URL;
    const MAX_RETRIES = 5;

    // ?´ë? ?¬í¼: ?€?„ì•„???˜ì¹˜
    const fetchWithTimeout = (url, opts, time = 30000) => {
        return Promise.race([
            fetch(url, opts),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request Timeout (30s)')), time))
        ]);
    };

    for (let i = 1; i <= MAX_RETRIES; i++) {
        try {
            const t = document.getElementById("toast");
            if (t && !silent) {
                t.innerText = i > 1 ? `?›°ï¸??œë²„ ?‘ë‹µ ì§€??.. ?¬ì‹œ??ì¤?(${i}/${MAX_RETRIES})` : "?›°ï¸??´ë¼?°ë“œ ?™ê¸°??ì¤?..";
                t.className = "show";
            }

            console.log(`?“¡ Attempt ${i}/${MAX_RETRIES} sending...`);
            console.log(`?“¡ Attempt ${i}/${MAX_RETRIES} sending...`);
            // [Modified] Use custom timeout from opts or default 60s (Increased for large GET)
            const timeoutMs = (payload.timeout) ? payload.timeout : 60000;

            const response = await fetchWithTimeout(masterUrl, {
                method: 'POST',
                // [Revert] Use default fetch behavior (like loadConfigFromCloud) which works reliably
                // redirect: 'follow', 
                // headers: { "Content-Type": "text/plain;charset=utf-8" }, 
                body: JSON.stringify(payload)
            }, timeoutMs);

            const text = await response.text();
            let json = { status: "Error" };
            try {
                // [Fix] Sanitize JSON string (handle newlines, tabs, and unescaped characters in text fields from server)
                // ?œë²„?ì„œ ?´ë ¤???ìŠ¤?¸ì— ì¤„ë°”ê¿ˆì´????´ ?´ìŠ¤ì¼€?´í”„?˜ì? ?Šê³  ?¤ì–´?ˆì„ ê²½ìš° ?Œì‹± ?ëŸ¬ ë°œìƒ ë°©ì?
                let sanitizedText = text;
                try {
                    // ê¸°ë³¸?ì¸ ?œì–´ ë¬¸ì ?´ìŠ¤ì¼€?´í”„ (JSON ???¬ë°”ë¥??Œì‹±???„í•¨)
                    sanitizedText = sanitizedText.replace(/[\n\r]/g, '\\n').replace(/\t/g, '\\t');
                    // ?•ê·œ?ìœ¼ë¡??˜ì • ???¤ì‹œ ?Œì‹± ?œë„
                    json = JSON.parse(sanitizedText);
                } catch (e2) {
                    // ?•ê·œ?ìœ¼ë¡œë„ ?´ê²° ???˜ë©´ ?ë˜ ?ìŠ¤?¸ë¡œ ?œë„ (ë³´ìˆ˜???‘ê·¼)
                    json = JSON.parse(text);
                }
            } catch (e) {
                // GAS ?¹ì„±???ìŠ¤?¸ë¡œ Successê°€ ?¤ëŠ” ê²½ìš° ì²˜ë¦¬
                if (text.includes("Success")) json = { status: "Success", text: text };
                else json = { status: "Error", message: text };
            }

            if (json.status === "Success") {
                // ?±ê³µ ??ì¦‰ì‹œ ë¦¬í„´
                return json;
            } else {
                throw new Error(json.message || "Unknown Server Error");
            }
        } catch (e) {
            console.warn(`Sync Attempt ${i} Failed:`, e);
            if (i === MAX_RETRIES) {
                // If standard fetch fails (likely CORS or network), try no-cors as last resort
                // [Fix] Do NOT use no-cors for GET requests (we need the response data)
                if (payload.type && payload.type.startsWith('GET_')) {
                    throw new Error("Maximum retries reached. Network request failed.");
                }

                // This allows data to reach the server even if we can't read the response (Fire & Forget)
                try {
                    console.log("?›°ï¸?Switching to no-cors mode...");
                    await fetch(masterUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        body: JSON.stringify(payload)
                    });
                    const t = document.getElementById("toast");
                    if (t) {
                        t.innerText = "? ï¸ ?€???”ì²­ ?„ì†¡??(?‘ë‹µ ?•ì¸ ë¶ˆê? - ?œíŠ¸ ?•ì¸ ?”ë§)";
                        t.className = "show";
                        setTimeout(() => t.className = t.className.replace("show", ""), 5000);
                    }
                    return { status: "Success", message: "Sent via no-cors (No Response)" };
                } catch (e2) {
                    throw e; // Throw original error if no-cors also fails
                }
            }
            // ?ì§„???€ê¸??œê°„ ì¦ê? (1ì´? 2ì´? 4ì´? ...)
            await new Promise(r => setTimeout(r, 1000 * Math.pow(1.2, i)));
        }
    }
}
function extractFolderId(url) {
    if (!url) return "";
    const matches = url.match(/folders\/([a-zA-Z0-9-_]+)/);
    if (matches) return matches[1];
    if (url.includes('/d/')) return url.split('/d/')[1].split('/')[0];
    return url.length > 20 ? url : "";
}

function convertToDirectLink(url) {
    if (!url || typeof url !== 'string') return "";
    try {
        // ?´ë? ë³€?˜ëœ ë§í¬??ê²½ìš°
        if (url.includes('googleusercontent.com/')) return url;

        // êµ¬ê? ?œë¼?´ë¸Œ ID ì¶”ì¶œ ?•ê·œ??(file/d/, id=, folders/ ???€??
        const patterns = [
            /file\/d\/([a-zA-Z0-9-_]+)/,
            /id=([a-zA-Z0-9-_]+)/,
            /folders\/([a-zA-Z0-9-_]+)/,
            /file\/d\/([a-zA-Z0-9-_]+)/,
            /id=([a-zA-Z0-9-_]+)/,
            /open\?id=([a-zA-Z0-9-_]+)/,
            /folders\/([a-zA-Z0-9-_]+)/,
            /uc\?.*id=([a-zA-Z0-9-_]+)/
        ];

        for (let pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                // ?¸ë„¤??URL ?¬ìš© (CORB ?°íšŒ)
                return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
            }
        }
    } catch (e) {
        console.error("Link conversion error:", e);
    }
    return url;
}

// êµ¬ê? ?œë¼?´ë¸Œ ë°??¼ë°˜ ?´ë?ì§€ URL???ˆì „?˜ê²Œ ?€?„ìŠ¤?¬í”„ë¥??ìš©?˜ëŠ” ?¬í¼
function getSafeImageUrl(url) {
    if (!url || typeof url !== 'string') return "";
    const directUrl = convertToDirectLink(url);
    // êµ¬ê? ?œë¼?´ë¸Œ ë§í¬??Data URI(base64)?ëŠ” ?€?„ìŠ¤?¬í”„ë¥?ë¶™ì´ì§€ ?ŠìŒ (?¤ë¥˜ ? ë°œ ë°©ì?)
    if (directUrl.includes('drive.google.com') || directUrl.startsWith('data:')) {
        return directUrl;
    }
    // ?¼ë°˜ HTTP ë§í¬?ë§Œ ìºì‹œ ë°©ì? ?€?„ìŠ¤?¬í”„ ?ìš©
    return directUrl.split('&t=')[0] + '&t=' + Date.now();
}

// ë¸Œëœ???ìš©
function applyBranding() {
    const hL = document.getElementById('h-logo'), sR = document.getElementById('rank-text');
    if (globalConfig.logo && hL) {
        const url = getSafeImageUrl(globalConfig.logo);
        hL.innerHTML = `<img id="initial-logo" src="${url}" style="max-height: 56px; width: auto; object-fit: contain;" onerror="this.src=''; if(this.parentElement) this.parentElement.innerText='Academy Logo';">`;
        hL.classList.remove('opacity-20');
    }
    if (sR) { sR.innerText = "ADMIN"; sR.className = "fs-32 font-black admin-text"; }
}

// --- New Layout Control ---
function changeMode(mode) {
    checkUnsavedChanges(() => {
        const body = document.body;
        const c = document.getElementById('dynamic-content');

        // Reset layout state
        // [Fix] student ëª¨ë“œ??ë¡œë”© ?„ë£Œ ???¬ì´?œë°” ?œê±° (renderStudentLogin ?´ë??ì„œ ì²˜ë¦¬)
        if (mode !== 'student') {
            body.classList.remove('has-sidebar');
        }

        if (mode === 'initial') {
            renderInitialScreen(); // Draw Initial Splash Screen (No Banner, No Start Button)
        }
        else if (mode === 'student') {
            renderStudentLogin(); // Draw Student Info Input Directly
        }
        else if (mode === 'auth_admin') {
            authMode = 'admin';
            renderAuthScreen(); // Draw Auth Form
        }
        else if (mode === 'auth_master') {
            authMode = 'master';
            renderAuthScreen(); // Draw Auth Form
        }
        else if (mode === 'admin_dashboard') {
            body.classList.add('has-sidebar');
            renderSidebarNav();
            changeTab('records'); // Default tab
        }
    });
}

function renderAuthScreen() {
    const c = document.getElementById('dynamic-content');
    setCanvasId(authMode === 'admin' ? '03' : '04');
    const isAdmin = authMode === 'admin';
    c.innerHTML = `
        <div class="animate-fade-in-safe flex flex-col items-center mt-5 space-y-10">
            <div class="canvas-premium-box !max-w-2xl w-full">
                <div class="flex flex-row items-start gap-10">

                    <!-- ì¢Œì¸¡: ?„ì´ì½?+ ?œëª© -->
                    <div class="flex flex-col items-center gap-4 flex-shrink-0 w-40 border-r border-slate-200 pr-10">
                        <div class="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner relative z-10 unified-animate">
                            ?”
                            <div class="absolute inset-0 bg-blue-100/30 rounded-full blur-2xl opacity-50 scale-150 -z-10"></div>
                        </div>
                        <h2 class="fs-18 ${isAdmin ? 'text-[#013976]' : 'text-sky-500'} uppercase text-center font-black tracking-tight leading-tight">
                            ${isAdmin ? 'ADMIN<br>ACCESS' : 'MASTER<br>CONSOLE'}
                        </h2>
                    </div>

                    <!-- ?°ì¸¡: ??-->
                    <div class="flex-1 space-y-4">
                        <input type="password" id="ac" class="ys-field text-center font-black" placeholder="Enter Access Code" autocomplete="off" onkeyup="if(event.key==='Enter') verifyAuth('${authMode}')">
                        <button onclick="verifyAuth('${authMode}')" class="btn-ys w-full !py-5 transition-all active:scale-95 fs-18 font-bold">?”‘ ACCESS NOW</button>
                        <button onclick="goHome()" class="w-full text-slate-400 fs-14 underline hover:text-red-500 transition-all font-medium">CANCEL &amp; RETURN</button>
                    </div>

                </div>
            </div>
        </div>
    `;
    setTimeout(() => document.getElementById('ac')?.focus(), 100);
}

// [ì´ˆê¸° ?”ë©´] ë°°ë„ˆ ë°??œì‘ ë²„íŠ¼ ?œê±°??
function renderInitialScreen() {
    // Restore Header/Footer/Sidebar visibility if needed
    const header = document.getElementById('app-header');
    const footer = document.getElementById('app-footer');
    const sidebar = document.getElementById('app-sidebar');
    const mainContainer = document.getElementById('main-container');

    if (header) header.style.display = ''; // [Fix] flexê°€ ?„ë‹ˆ??ë¹?ë¬¸ì?´ë¡œ CSS ?°ì„ ê¶?ë³µì›
    if (footer) footer.style.display = '';
    if (sidebar) sidebar.style.display = ''; // [Fix] ?œí—˜ ëª¨ë“œ ?±ì—??ê°•ì œë¡?none ì²˜ë¦¬???¬ì´?œë°” ë³µì›!

    if (mainContainer) {
        mainContainer.style.height = ''; // Reset to CSS calc
        mainContainer.style.padding = ''; // Reset
        mainContainer.style.margin = '';
        mainContainer.style.maxWidth = '';
        mainContainer.style.display = '';
    }

    const c = document.getElementById('dynamic-content');
    setCanvasId('01');
    c.className = "w-full h-full"; // Reset class
    c.innerHTML = `
                <div class="animate-fade-in-safe flex flex-col items-center pb-20 mt-5 space-y-10">
                    <div class="canvas-premium-box !max-w-4xl hover:scale-[1.01]">
                        <div class="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner relative z-10 unified-animate">
                            ?“
                            <div class="absolute inset-0 bg-blue-100/30 rounded-full blur-2xl opacity-50 scale-150 -z-10"></div>
                        </div>
                        
                        <h1 class="fs-32 text-[#013976] mb-4 tracking-tighter uppercase leading-none font-black text-center">
                            AESTHESIA SCHOOL
                        </h1>
                        <p class="fs-14 text-slate-400 mb-12 tracking-[0.2em] font-medium text-center">AI POWERED ASSESSMENT ENGINE</p>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                            <button onclick="changeMode('student')" class="group p-10 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-[#013976] hover:bg-slate-50 transition-all duration-500 text-center shadow-lg hover:shadow-2xl">
                                <span class="text-5xl block mb-4 group-hover:scale-110 transition-transform">?“</span>
                                <h3 class="fs-18 text-[#013976] font-black uppercase mb-2">Student Login</h3>
                                <p class="text-slate-400 fs-14 font-medium">?œí—˜ ?‘ì‹œ ë°??±ì  ?•ì¸</p>
                            </button>
                            <button onclick="changeMode('auth_admin')" class="group p-10 bg-[#013976] border-2 border-transparent rounded-[2rem] hover:bg-[#002855] transition-all duration-500 text-center shadow-lg hover:shadow-2xl">
                                <span class="text-5xl block mb-4 group-hover:scale-110 transition-transform">?™ï¸</span>
                                <h3 class="fs-18 text-white font-black uppercase mb-2">Admin Panel</h3>
                                <p class="text-blue-200/60 fs-14 font-medium">ê´€ë¦¬ì ?„ìš© ?€?œë³´??/p>
                            </button>
                        </div>
                    </div>
                </div>
            `;
}

function renderStudentView() {
    // Deprecated but kept for reference if needed, functionality moved to renderInitialScreen and renderStudentLogin
    renderInitialScreen();
}

function goHome() {
    // Reset Session
    examSession.isExamActive = false;
    // Go to initial view
    changeMode('initial');
}

// ?œí—˜ ì§„í–‰ ì¤??•ì¸ ?¨ìˆ˜
function checkExamInProgress() {
    if (examSession.isExamActive) {
        alert("?œí—˜??ì§„í–‰ ì¤‘ì…?ˆë‹¤. ?œí—˜ ?”ë©´?¼ë¡œ ?´ë™?˜ì„¸??");
        // ê°•ì œë¡??œí—˜ ?”ë©´ ?Œë”ë§?(Student Mode ?´ì—??ì²˜ë¦¬)
        return true;
    }
    return false;
}

// ?œí—˜ ì·¨ì†Œ ?¨ìˆ˜
function cancelExam() {
    if (confirm("?•ë§ ?œí—˜??ì·¨ì†Œ?˜ê² ?µë‹ˆê¹?")) {
        if (examTimer) clearInterval(examTimer);
        examSession = { studentName: "", grade: "", date: "", categoryId: "", answers: {}, startTime: null, isExamActive: false };
        alert("?œí—˜??ì·¨ì†Œ?˜ì—ˆ?µë‹ˆ??");
        goHome();
    }
}


async function verifyAuth(mode) {
    const pw = document.getElementById('ac').value;
    if (!pw) return showToast("ë¹„ë?ë²ˆí˜¸ë¥??…ë ¥?˜ì„¸??");

    toggleLoading(true);

    // 1. ?´ë¼?°ë“œ ìµœì‹  ?•ë³´ ?™ê¸°??(Strict Cloud-First)
    try {
        if (globalConfig.masterUrl) {
            // [Modified] Sync attempt
            const success = await loadConfigFromCloud(true);

            // [Deadlock Fix] ë©”ì¸ ?œë²„ ë§í¬ê°€ ?†ì–´???¤íŒ¨??ê²½ìš°(ì´ˆê¸° ?¸íŒ… ???ëŠ” 
            // ë¡œê·¸?¸ì„ ?ˆìš©?´ì•¼ ?¤ì •??ê°€?¥í•¨. ?°ë¼???¤íŒ¨?´ë„ ë¡œì»¬ ì½”ë“œë¡?ê²€ì¦??œë„.
            if (!success) {
                if (!globalConfig.mainServerLink) {
                    console.log("? ï¸ Main Server Link missing. Allowing offline auth for initial setup.");
                } else {
                    // ë§í¬ê°€ ?ˆëŠ”???¤íŒ¨?ˆë‹¤ë©?ì§„ì§œ ?¤íŠ¸?Œí¬ ?¤ë¥˜?´ê±°??ê¶Œí•œ ë¬¸ì œ
                    console.warn("? ï¸ Sync failed but link exists. Proceeding with caution.");
                    // throw new Error("Cloud Sync Failed"); // [Strict Mode Off] -> ?¬ìš©?±ì„ ?„í•´ ?¤í”„?¼ì¸ ?ˆìš©
                }
            }
        } else {
            // URL???†ëŠ” ìµœì´ˆ ?íƒœë©??ˆì™¸?ìœ¼ë¡??µê³¼ (?¤ì •?˜ëŸ¬ ?¤ì–´ê°€???˜ë?ë¡?
            console.log("Master URL not set, skipping sync");
        }
    } catch (e) {
        // [Strict] ?¤í”„?¼ì¸ ì§„ì… ì°¨ë‹¨
        toggleLoading(false);
        console.warn("Auth Sync Failed");
        showToast("???¤íŠ¸?Œí¬ ?°ê²°???„ìš”?©ë‹ˆ?? (ë³´ì•ˆ ?‘ì† ë¶ˆê?)");
        return; // ì§„ì… ì°¨ë‹¨
    }

    toggleLoading(false);

    // 2. ê²€ì¦?(?™ê¸°?”ëœ ?°ì´?°ë¡œ ?€ì¡? - [Fix] ?€??ë¶ˆì¼ì¹??«ì/ë¬¸ì) ë°©ì?ë¥??„í•´ ë¬¸ì??ë³€??ë¹„êµ
    if (mode === 'admin' && String(pw) === String(globalConfig.adminCode)) {
        changeMode('admin_dashboard');
    } else if (mode === 'master' && String(pw) === String(globalConfig.masterCode || "0000")) {
        // [Refactor] master_dashboard ?œê±° - ?¸ì¦ ?±ê³µ ??ì§ì ‘ ì£¼ìš”?¬í•­ ?¤ì •?¼ë¡œ ?´ë™
        const c = document.getElementById('dynamic-content');
        renderMainConfig(c);
    } else {
        showToast("??ë¹„ë?ë²ˆí˜¸ê°€ ?¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤.");
        const el = document.getElementById('ac');
        if (el) { el.value = ''; el.focus(); }
    }
}


// --- Student Mode Logic (Global) ---
function startStudentMode() {
    renderStudentLogin();
}




function renderSidebarNav() {
    let b = `<button onclick="changeTab('records')" id="btn-records" class="w-full p-4 rounded-xl font-black text-slate-400 hover:text-white flex items-center gap-4 fs-18 text-left transition-all">?“Š ?™ìƒ ?±ì ???•ì¸</button><button onclick="changeTab('score_input')" id="btn-score_input" class="w-full p-4 rounded-xl font-black text-slate-400 hover:text-white flex items-center gap-4 fs-18 text-left transition-all">?ï¸ ?™ìƒ ?±ì  ?˜ë™ ?…ë ¥</button><button onclick="changeTab('stats')" id="btn-stats" class="w-full p-4 rounded-xl font-black text-slate-400 hover:text-white flex items-center gap-4 fs-18 text-left transition-all">?“ˆ ë¬¸í•­ ë°??™ìƒ ?µê³„</button><button onclick="changeTab('bank')" id="btn-bank" class="w-full p-4 rounded-xl font-black text-slate-400 hover:text-white flex items-center gap-4 fs-18 text-left transition-all">?“‹ ë¬¸í•­ ë¦¬ìŠ¤???±ë¡Â·?˜ì •</button>`;
    b += `<button onclick="changeTab('cat_manage')" id="btn-cat_manage" class="w-full p-4 rounded-xl font-black text-slate-400 hover:text-white flex items-center gap-4 fs-18 text-left transition-all">?“‚ ?œí—˜ì§€ ê´€ë¦?/button>`;
    document.getElementById('sidebar-nav').innerHTML = b;
    applyBranding();
}

// --- ?´íƒˆ ë°©ì? ë¡œì§ ---
function hasUnsavedChanges() {
    const c = document.getElementById('dynamic-content');
    if (!c) return false;
    const cid = c.getAttribute('data-canvas-id');

    // 06: ?±ì  ?˜ë™ ?…ë ¥ ???™ìƒëª??ëŠ” ë¬¸í•­ ?ìˆ˜ ?…ë ¥ ??ê²½ê³ 
    if (cid === '06') {
        const nameVal = document.getElementById('input-student-name')?.value?.trim();
        if (nameVal) return true;
        const hasQScore = Array.from(document.querySelectorAll('[id^="q-score-"]')).some(inp => inp.value !== '');
        if (hasQScore) return true;
        return false;
    }
    // 08: ì¹´í…Œê³ ë¦¬ê°€ ? íƒ???íƒœ(ë¦¬ìŠ¤??ì¡°íšŒ ì¤??ì„œ ?´íƒˆ ??ê²½ê³ 
    if (cid === '08') {
        return !!curCatId;
    }
    // 07-2(ë¶€ë¶??˜ì •), 08-1(?±ë¡), 08-2(?˜ì •): ì§„ì…???íƒœ?¼ë©´ ë¬´ì¡°ê±?ê²½ê³ 
    if (cid === '08-2' || cid === '08-1' || cid === '08-2') {
        return true;
    }
    return false;
}

function checkUnsavedChanges(callback) {
    if (hasUnsavedChanges()) {
        if (confirm("?‘ì—… ì¤‘ì¸ ?•ë³´ë¥??€?¥í•˜ì§€ ?Šì•˜??ê²½ìš° ?•ë³´ê°€ ?ì‹¤?©ë‹ˆ??")) {
            callback();
        }
    } else {
        callback();
    }
}

function changeTab(tab) {
    checkUnsavedChanges(() => {
        // [Fix] ???„í™˜ ???ˆì´?„ì›ƒ ?„ì „ ë³µì› (?´ëŠ ??—???€???•ìƒ??
        const _header = document.getElementById('app-header');
        const _footer = document.getElementById('app-footer');
        const _mc = document.getElementById('main-container');
        const _ac = document.getElementById('app-canvas');
        const _dc = document.getElementById('dynamic-content');
        if (_header) _header.style.display = '';
        if (_footer) _footer.style.display = '';
        if (_mc) { _mc.style.marginTop = ''; _mc.style.height = ''; }
        if (_ac) {
            _ac.style.padding = '';
            _ac.style.overflow = '';
            _ac.style.overflowY = '';
            _ac.classList.remove('!p-0', '!overflow-hidden');
        }
        if (_dc) _dc.className = 'w-full h-full';

        document.querySelectorAll('#sidebar-nav button').forEach(el => el.className = "w-full p-4 rounded-xl font-black text-slate-400 hover:text-white flex items-center gap-4 fs-18 text-left transition-all");
        const active = document.getElementById('btn-' + tab); if (active) active.className = "w-full p-4 rounded-xl font-black text-white bg-white/10 flex items-center gap-4 fs-18 text-left transition-all";
        const c = document.getElementById('dynamic-content');
        if (tab === 'records') renderRecords(c);
        if (tab === 'score_input') renderScoreInput(c);
        if (tab === 'bank') { curCatId = ''; renderBank(c); }
        if (tab === 'reg') renderRegForm();
        if (tab === 'main_config') renderMainConfig(c);
        if (tab === 'cat_manage') renderCatManage(c);
        if (tab === 'stats') renderStats(c);
    });
}

// --- ë¡œê³  ë°??ì‚° ê´€ë¦?(?µí•©?? ---


async function upAs(e, k) {
    const file = e.target.files[0];
    if (!file) {
        console.log("No file selected");
        return;
    }

    console.log("File selected:", file.name, "Type:", k);

    const masterUrl = globalConfig.masterUrl;
    if (!masterUrl) {
        console.error("Master URL not set");
        return showToast("ë§ˆìŠ¤???±í¬ ì£¼ì†Œë¥?ë¨¼ì? ?€?¥í•´ ì£¼ì„¸??");
    }

    const targetFolderId = extractFolderId(globalConfig.mainServerLink);

    if (!targetFolderId) {
        console.error("No Main Server Folder ID available");
        return showToast("ë©”ì¸ ?œë²„ ?´ë”ê°€ ?¤ì •?˜ì? ?Šì•˜?µë‹ˆ??");
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
        const localData = ev.target.result;
        console.log("File loaded, size:", localData.length);

        // 1?¨ê³„: ë¡œì»¬ ?´ë?ì§€ ì¦‰ì‹œ ?”ë©´???¸ì¶œ (?¬ìš©???€ê¸?ë°©ì?)
        const previewEl = document.getElementById(`pv-${k}`);
        if (previewEl) {
            previewEl.innerHTML = `<img src="${localData}" class="max-h-full p-6 opacity-60 animate-pulse">`;
        }

        toggleLoading(true); // ë¡œë”© ?œì‘
        showToast("?›°ï¸??´ë¼?°ë“œ ?™ê¸°??ì¤?..");

        try {
            const masterUrl = globalConfig.masterUrl || DEFAULT_MASTER_URL;
            const payload = {
                type: 'LOGO_SAVE',
                parentFolderId: targetFolderId, // [Single Root] Target Main Folder
                fileData: localData.split(',')[1],
                mimeType: file.type,
                assetName: k
            };

            console.log("Sending payload to server...");
            // [?µì‹¬] 10???¬ì‹œ??ë³´ì¥ ?„ì†¡
            const result = await sendReliableRequest(payload);

            if (result.status === "Success") {
                const finalUrl = result.url || (result.text ? result.text.match(/https?:\/\/[^\s]+/)?.[0] : "");
                if (finalUrl) {
                    console.log("Upload success! URL:", finalUrl);
                    const safeUrl = getSafeImageUrl(finalUrl);
                    globalConfig[k] = safeUrl; // [Refactor] Update flat config (logo/banner)
                    save();
                    await saveConfigToCloud();
                    applyBranding();
                    if (previewEl) previewEl.innerHTML = `<img src="${globalConfig[k]}" class="max-h-full p-6">`;
                    showToast(`???´ë¼?°ë“œ ?€???±ê³µ!`);
                    changeTab('main_config'); // [Standardization] Reset view after action (Updated to main_config)
                } else { throw new Error("URL missing in response"); }
            } else {
                throw new Error("Upload failed: " + (result.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Upload error:", err);
            showToast("???„ì†¡ ?¤íŒ¨: " + err.message);
            // ë¡œì»¬ ?„ì‹œ ë³´ê? ë¡œì§ ?œê±° (?¬ìš©???˜ë„ ë°˜ì˜: ?œë²„ ?¤íŒ¨ ???•ì‹¤???¤íŒ¨ ì²˜ë¦¬)
            if (previewEl) {
                // ?¤íŒ¨ ??ë¯¸ë¦¬ë³´ê¸° ?œê±° ?ëŠ” ?ëŸ¬ ?œì‹œ
                previewEl.innerHTML = '<span class="text-base text-red-500 font-bold">Upload Failed</span>';
            }
        } finally {
            toggleLoading(false); // ë¡œë”© ì¢…ë£Œ
        }
    };

    reader.onerror = (err) => {
        console.error("FileReader error:", err);
        showToast("???Œì¼ ?½ê¸° ?¤ë¥˜");
    };

    reader.readAsDataURL(file);
}



// 4. [ê¸°ëŠ¥] ? í˜•ë³?UI ê°€?´ë“œ ë°?ê°€?œì„± ?œì–´
function toggleTypeUI(type) {
    const choiceArea = document.getElementById('choice-area');
    const ansInput = document.getElementById('q-ans');
    const ansLabel = document.getElementById('ans-label');

    if (type === 'choice') {
        choiceArea.classList.remove('hidden');
        ansInput.placeholder = "?•ë‹µ ë²ˆí˜¸ (1-5)";
        ansLabel.innerText = "5. Answer (ê°ê????•ë‹µ)";
        renderOptions(document.getElementById('opt-cnt').value);
    } else if (type === 'short') {
        choiceArea.classList.add('hidden');
        ansInput.placeholder = "?¨ë‹µ???¤ì›Œ???…ë ¥";
        ansLabel.innerText = "5. Answer (ì£¼ê????•ë‹µ)";
    } else if (type === 'essay') {
        choiceArea.classList.add('hidden');
        ansInput.placeholder = "?œìˆ ??ëª¨ë²” ?µì•ˆ ?¹ì? ê°€?´ë“œ ?…ë ¥";
        ansLabel.innerText = "5. Model Answer (?‘ë¬¸??ëª¨ë²”?µì•ˆ)";
    }
}

// 5. [ê¸°ëŠ¥] ?¸ë? ? í˜• ëª©ë¡ ?…ë°?´íŠ¸
// 5. [ê¸°ëŠ¥] ?¸ë? ? í˜• ëª©ë¡ ?…ë°?´íŠ¸
function upDet(v) {
    const s = document.getElementById('q-subtype') || document.getElementById('q-det');
    if (!s) return;

    if (!v) {
        s.innerHTML = '<option value="" disabled selected hidden>ì£??ì—­??ë¨¼ì? ? íƒ?˜ì„¸??/option>';
        return;
    }

    const list = [...(SUB_TYPE_MAP[v] || [])];
    if (list.length === 0) {
        s.innerHTML = '<option value="" disabled selected hidden>?´ë‹¹ ì£??ì—­???¸ë? ??ª©???†ìŠµ?ˆë‹¤</option>';
    } else {
        s.innerHTML = '<option value="" disabled selected hidden>?¸ë? ?ì—­??? íƒ?˜ì„¸??/option>' + list.map(t => `<option value="${t}">${t}</option>`).join('');
    }
}

// 6. [ê¸°ëŠ¥] ?´ë?ì§€ ?Œì¼ Base64 ì¶”ì¶œ (H?? I??
function handleDualFile(e, idx) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
        const obj = { base64: ev.target.result.split(',')[1], name: f.name, mime: f.type };
        if (idx === 1) fData1 = obj; else fData2 = obj;
        document.getElementById(`pv-${idx}`).innerHTML = `<img src="${ev.target.result}" class="max-h-full mx-auto object-contain rounded-xl">`;
    };
    r.readAsDataURL(f);
}

// 7. [ê¸°ëŠ¥] ê°ê???ë³´ê¸° ?…ë ¥ ë°•ìŠ¤ ?™ì  ?ì„±
function renderOptions(cnt) {
    const g = document.getElementById('opt-grid'); g.innerHTML = '';
    for (let i = 0; i < cnt; i++) {
        g.innerHTML += `
                    <div class="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 focus-within:border-[#013976] transition-all hover:bg-white hover:shadow-md duration-300">
                        <span class="fs-18 text-[#013976] opacity-30">${i + 1}</span>
                        <input type="text" id="opt-${i}" class="bg-transparent border-none outline-none text-base flex-grow placeholder:text-slate-300" placeholder="ë³´ê¸° ${i + 1} ?´ìš©???…ë ¥?˜ì„¸??>
                    </div>`;
    }
}

// 8. [ê¸°ëŠ¥] ìµœì¢… ?´ë¼?°ë“œ ?„ì†¡ ë°??êµ¬ ?€??
// 8. [ê¸°ëŠ¥] ìµœì¢… ?´ë¼?°ë“œ ?„ì†¡ ë°??êµ¬ ?€??
async function saveQ() {
    const btn = document.getElementById('save-btn');

    try {
        const txt = document.getElementById('q-text').value;
        const ans = document.getElementById('q-ans').value;
        const type = document.getElementById('q-type').value;

        if (!txt || !ans) throw new Error("ë¬¸í•­ ?´ìš©ê³??•ë‹µ(?µì•ˆ)?€ ?„ìˆ˜ ?…ë ¥ ?¬í•­?…ë‹ˆ??");

        btn.disabled = true;
        btn.innerText = "?›°ï¸?CLOUD SYNCING...";

        // [?˜ì •] DOM?ì„œ ì§ì ‘ ê°’ì„ ?½ì–´?€ ? ë¢°???•ë³´
        const catSelect = document.getElementById('reg-cat-select');
        if (catSelect) curCatId = catSelect.value;

        const cat = globalConfig.categories.find(c => c.id === curCatId);
        if (!cat) throw new Error("? íƒ??ì¹´í…Œê³ ë¦¬ê°€ ? íš¨?˜ì? ?ŠìŠµ?ˆë‹¤. ì¹´í…Œê³ ë¦¬ë¥??¤ì‹œ ? íƒ?´ì£¼?¸ìš”.");

        // ?´ë” ID ì¶”ì¶œ ë°?ê²€ì¦?
        let pId = "";
        try {
            pId = extractFolderId(cat.targetFolderUrl);
        } catch (e) { console.warn("Folder ID extraction failed", e); }

        if (!pId) throw new Error(`'${cat.name}' ì¹´í…Œê³ ë¦¬???´ë” ì£¼ì†Œê°€ ?¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤. ?¤ì •?ì„œ ?•ì¸?´ì£¼?¸ìš”.`);

        let options = [];
        if (type === 'choice') {
            const optCnt = document.getElementById('opt-cnt').value;
            for (let i = 0; i < optCnt; i++) {
                const val = document.getElementById(`opt-${i}`).value;
                if (val) options.push(val);
            }
        }

        const payload = {
            type: 'QUESTION_SAVE_INDEPENDENT',
            parentFolderId: pId,
            categoryName: cat.name,
            id: Date.now(),
            catId: curCatId,
            questionType: type,
            difficulty: document.getElementById('q-diff').value,
            section: document.getElementById('q-sec').value,
            subType: document.getElementById('q-det').value,
            passage1: document.getElementById('q-p1').value,
            questionTitle: txt,
            text: txt,
            answer: ans,
            score: document.getElementById('q-score').value,
            options: options,
            fileData1: fData1?.base64 || "", fileName1: fData1?.name || "", mimeType1: fData1?.mime || "",
            fileData2: fData2?.base64 || "", fileName2: fData2?.name || "", mimeType2: fData2?.mime || ""
        };

        const serverPayload = { ...payload, multipleChoiceConfig: JSON.stringify(options), options: JSON.stringify(options) };

        const masterUrl = globalConfig.masterUrl || DEFAULT_MASTER_URL;
        if (!masterUrl) throw new Error("Master URL (Apps Script URL)???¤ì •?˜ì? ?Šì•˜?µë‹ˆ??");

        // [?µì‹¬] 10???¬ì‹œ??ë³´ì¥ ?„ì†¡
        const result = await sendReliableRequest(serverPayload);

        // 2. ?±ê³µ ???°ì´??ë°˜ì˜
        payload.fileUrl1 = result.fileUrl1 || payload.fileUrl1;
        payload.fileUrl2 = result.fileUrl2 || payload.fileUrl2;

        // ê±°ë? ?°ì´???•ë¦¬
        delete payload.fileData1; delete payload.fileData2;
        delete payload.fileName1; delete payload.fileName2;
        delete payload.mimeType1; delete payload.mimeType2;

        globalConfig.questions.push(payload);
        save();
        saveConfigToCloud(); // [ìµœì ?? ë°±ê·¸?¼ìš´?œì—???™ê¸°??ì§„í–‰ (UI ì§€??ë°©ì?)

        showToast("??ë¬¸í•­???´ë¼?°ë“œ DB???ˆì „?˜ê²Œ ?€?¥ë˜?ˆìŠµ?ˆë‹¤.");

        // ì´ˆê¸°??
        fData1 = null; fData2 = null;
        changeTab('bank');

    } catch (e) {
        console.error("SaveQ Error:", e);
        showToast("???€???¤íŒ¨: " + e.message);
        btn.disabled = false;
        btn.innerText = "Sync & Save to Academy DB (Retry)";
    }
}


// 8-2. [ê¸°ëŠ¥] ë¬¸í•­ ?˜ì • ???Œë”ë§?(08-1ê³?ê·œê²© ?™ê¸°??- Category Select ?œê±°) - OBSOLETE (êµ¬í˜• ??
async function obsolete_renderEditForm(id) {
    const q = globalConfig.questions.find(item => String(item.id).trim() === String(id).trim());
    if (!q) return showToast("ë¬¸í•­ ?•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.");

    const c = document.getElementById('dynamic-content');
    setCanvasId('08-2', 'full'); // Use full layout similar to 08-1
    document.getElementById('app-canvas').classList.add('!overflow-hidden');

    const attemptReturn = () => {
        if (confirm("?˜ì •??ì·¨ì†Œ?˜ê³  ?Œì•„ê°€?œê² ?µë‹ˆê¹?")) {
            document.getElementById('app-canvas').classList.remove('!overflow-hidden');
            renderBank();
        }
    };

    c.innerHTML = `
        <div class="h-full flex flex-col p-6 animate-fade-in text-[14px] font-normal text-slate-700 bg-slate-50">
            <!-- Header -->
            <div class="flex justify-between items-center mb-4 flex-shrink-0">
                 <div>
                    <h2 class="text-[18px] font-bold text-[#013976] flex items-center gap-2">
                        <span class="text-xl">?ï¸</span> Edit Question (ë¬¸í•­ ?˜ì •)
                    </h2>
                    <p class="text-slate-500 text-xs mt-1">ID: ${q.id}</p>
                </div>
                
                <div class="flex items-center gap-3">
                     <button onclick="updateQuestion('${q.id}')" class="btn-ys !bg-[#013976] !text-white !py-2.5 !px-5 !text-[14px] !font-bold shadow-md hover:brightness-110 flex items-center gap-2">
                        ?’¾ Update
                    </button>
                    <div class="w-px h-6 bg-slate-300 mx-1"></div>
                    <button onclick="(${attemptReturn})()" class="btn-ys bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 !py-2 !px-4 !text-[14px] !font-normal">
                        Cancel
                    </button>
                </div>
            </div>

            <div class="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
                <!-- [LEFT] Common Settings & Passage -->
                <div class="w-full lg:w-5/12 flex flex-col gap-4 min-h-0 overflow-y-auto custom-scrollbar pb-10">
                    
                    <!-- Common Settings (Read Only Category) -->
                    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex-shrink-0">
                        <h3 class="text-[16px] font-bold text-[#013976] mb-3 flex items-center gap-2">
                            <span>?™ï¸ Common Settings</span>
                        </h3>
                         <div class="flex items-center gap-4">
                            <div class="flex-1">
                                <label class="block text-[14px] font-bold text-pink-600 mb-1">Category (?œí—˜ì§€)</label>
                                <div class="w-full p-2 border rounded-lg text-[14px] font-bold bg-slate-100 text-slate-500">
                                    ${globalConfig.categories.find(c => c.id === q.catId)?.name || 'Unknown Category'}
                                </div>
                            </div>
                        </div>
                    </div>

                     <div class="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[400px] relative group flex-shrink-0">
                        <!-- Toolbar -->
                        <div class="p-2 border-b bg-slate-50 flex gap-1 flex-wrap items-center sticky top-0 z-10 rounded-t-2xl">
                            <button onclick="execCmd('bold')" class="p-1.5 rounded hover:bg-slate-200 text-slate-600 font-bold text-[14px]" title="Bold">B</button>
                            <button onclick="execCmd('underline')" class="p-1.5 rounded hover:bg-slate-200 text-slate-600 underline text-[14px]" title="Underline">U</button>
                            <button onclick="execCmd('italic')" class="p-1.5 rounded hover:bg-slate-200 text-slate-600 italic text-[14px]" title="Italic">I</button>
                            <div class="w-px h-4 bg-slate-300 mx-1"></div>
                            
                            <!-- Symbols -->
                            <button onclick="insertSymbol('??)" class="p-1.5 rounded hover:bg-slate-200 text-[14px] text-slate-600">??</button>
                            <button onclick="insertSymbol('??)" class="p-1.5 rounded hover:bg-slate-200 text-[14px] text-slate-600">??</button>
                            <button onclick="insertSymbol('??)" class="p-1.5 rounded hover:bg-slate-200 text-[14px] text-slate-600">??</button>
                            <button onclick="insertSymbol('??)" class="p-1.5 rounded hover:bg-slate-200 text-[14px] text-slate-600">??</button>
                            <button onclick="insertSymbol('??)" class="p-1.5 rounded hover:bg-slate-200 text-[14px] text-slate-600">??</button>
                            <button onclick="insertSymbol('??)" class="p-1.5 rounded hover:bg-slate-200 text-[14px] text-slate-600">??</button>
                            <button onclick="insertSymbol('??)" class="p-1.5 rounded hover:bg-slate-200 text-[14px] text-slate-600">??</button>
                            <button onclick="insertSymbol('??)" class="p-1.5 rounded hover:bg-slate-200 text-[14px] text-slate-600">??</button>
                            <button onclick="insertSymbol('??)" class="p-1.5 rounded hover:bg-slate-200 text-[14px] text-slate-600">??</button>
                        </div>
                        
                        <div class="p-4 pb-0">
                             <input type="text" id="edit-common-title" value="${q.commonTitle || ''}"
                                class="w-full py-2 pl-0 pr-2 text-[14px] font-normal border-b-2 border-indigo-100 focus:border-indigo-500 outline-none text-[#013976] placeholder-slate-300 transition-colors"
                                placeholder="[ê³µí†µ ë°œë¬¸]">
                        </div>

                        <div id="edit-passage-editor" class="flex-1 p-4 outline-none text-[14px] leading-relaxed text-slate-700 font-sans" contenteditable="true"></div>
                        
                        <!-- Image Upload (Hidden by default or similar to Reg form if needed, leaving layout compatible) -->
                     </div>
                </div>

                <!-- [RIGHT] Single Question Item -->
                <div class="w-full lg:w-7/12 flex flex-col gap-4 min-h-0 overflow-y-auto custom-scrollbar pb-20">
                     <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center sticky top-0 z-20 shadow-sm backdrop-blur-sm bg-opacity-90">
                        <h3 class="text-[16px] font-bold text-indigo-800 flex items-center gap-2">
                            <span>?“ Question List</span>
                        </h3>
                    </div>
                    
                    <div id="edit-q-container"></div>
                </div>
            </div>
        </div>
    `;

    // Populate Passage
    let pContent = q.passage1 || "";
    if (q.commonTitle && pContent.includes(q.commonTitle)) {
        pContent = pContent.replace(new RegExp(`<p[^>]*>${q.commonTitle}</p>`), '');
    }
    document.getElementById('edit-passage-editor').innerHTML = pContent;

    // Render single item reusing renderRegItem logic
    // Note: renderRegItem is designed for list items. For edit form, we use it for a single item.
    // We treat it as index 1.
    renderRegItem('edit-q-container', 1, q, 'edit');
}

async function obsolete_updateQ(id) {
    const q = globalConfig.questions.find(item => String(item.id).trim() === String(id).trim());
    if (!q) return;

    if (!confirm('?’¾ ?˜ì •??ë¬¸í•­ ?•ë³´ë¥??€?¥í•˜?œê² ?µë‹ˆê¹?')) return;

    if (!globalConfig.masterUrl) {
        showToast('? ï¸ ë§ˆìŠ¤??URL???¤ì •?˜ì? ?Šì•˜?µë‹ˆ?? ?¤ì • ??—??ë¨¼ì? ?±ë¡??ì£¼ì„¸??');
        return;
    }

    const cat = globalConfig.categories.find(c => c.id === q.catId);
    if (!cat) {
        showToast('? ï¸ ë¬¸í•­??ì¹´í…Œê³ ë¦¬ ?•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.');
        return;
    }

    // 08-1ê³??™ì¼???„ë“œ ID ?¬ìš©
    const sec = document.getElementById('q-section').value;
    const sub = document.getElementById('q-subtype').value.trim();
    const qType = document.getElementById('q-type').value;
    const diff = document.getElementById('q-difficulty').value;
    const title = document.getElementById('q-title').value.trim();
    const commonTitle = document.getElementById('q-common-title')?.value.trim() || '';
    const pass1 = document.getElementById('q-passage1').value.trim();
    const scr = parseInt(document.getElementById('q-score').value) || 0;
    let ans = document.getElementById('q-answer').value.trim();

    // [Validation] ?ì—­, ? í˜•, ë°°ì , ë°œë¬¸ ?„ìˆ˜
    if (!sec) { showToast('? ï¸ ì£??ì—­??? íƒ??ì£¼ì„¸??(Section required)'); return; }
    if (!qType) { showToast('? ï¸ ë¬¸í•­ ? í˜•??? íƒ??ì£¼ì„¸??(Type required)'); return; }
    if (scr <= 0) { showToast('? ï¸ ë°°ì ?€ 1???´ìƒ?´ì–´???©ë‹ˆ??(Score > 0)'); return; }
    if (!title) {
        showToast('? ï¸ ë¬¸í•­ ë°œë¬¸?€ ?„ìˆ˜?…ë‹ˆ??(Title required)');
        document.getElementById('q-title').focus();
        return;
    }

    // [Validation] ? í˜•ë³??•ë‹µ/ë³´ê¸° ì²´í¬
    if (qType !== '?‘ë¬¸?? && !ans) {
        showToast('? ï¸ ?•ë‹µ???…ë ¥??ì£¼ì„¸??(Answer required)');
        document.getElementById('q-answer').focus();
        return;
    }
    if (qType === 'ê°ê???) {
        const checkChoices = Array.from(document.querySelectorAll('.q-choice-input')).map(i => i.value.trim());
        if (checkChoices.every(v => v === "")) {
            showToast('? ï¸ ê°ê???ë³´ê¸°ë¥??…ë ¥??ì£¼ì„¸??(Choices required)');
            return;
        }
    }

    // ?´ë?ì§€ ì²˜ë¦¬ (?ˆë¡œ ? íƒ???Œì¼???ˆìœ¼ë©??…ë¡œ??ì¤€ë¹?
    const img1 = document.getElementById('q-img1').files[0];
    const img2 = document.getElementById('q-img2').files[0];

    let fd1 = null, mt1 = null, fn1 = null;
    let fd2 = null, mt2 = null, fn2 = null;

    if (img1) {
        const r1 = new FileReader();
        await new Promise(res => {
            r1.onload = e => {
                fd1 = e.target.result.split(',')[1];
                mt1 = img1.type;
                fn1 = img1.name;
                res();
            };
            r1.readAsDataURL(img1);
        });
    }

    if (img2) {
        const r2 = new FileReader();
        await new Promise(res => {
            r2.onload = e => {
                fd2 = e.target.result.split(',')[1];
                mt2 = img2.type;
                fn2 = img2.name;
                res();
            };
            r2.readAsDataURL(img2);
        });
    }

    let mc = '', model = '', options = [];
    ans = document.getElementById('q-answer').value.trim();
    if (qType === 'ê°ê???) {
        const count = parseInt(document.getElementById('q-choice-count').value);
        for (let i = 1; i <= count; i++) {
            const val = document.getElementById(`q - choice - ${i} `).value.trim();
            if (val) {
                options.push(val);
                mc += `${i}. ${val} \n`;
            }
        }
        ans = document.getElementById('q-answer').value.trim();
    } else if (qType === 'ì£¼ê???) {
        ans = document.getElementById('q-answer').value.trim();
    } else {
        model = document.getElementById('q-model').value.trim();
        ans = document.getElementById('q-answer').value.trim();
    }

    const payload = {
        type: 'QUESTION_UPDATE_INDEPENDENT',
        parentFolderId: extractFolderId(cat.targetFolderUrl),
        categoryName: cat.name,
        id: q.id,
        catId: q.catId,
        questionType: qType,
        difficulty: diff,
        section: sec,
        subType: sub,
        passage1: pass1,
        commonTitle: commonTitle,
        questionTitle: title,
        text: title,
        answer: ans,
        score: scr,
        multipleChoiceConfig: mc.trim(),
        options: options,
        modelAnswer: model,
        imgUrl1: q.fileUrl1 || q.imgUrl1 || "",
        imgUrl2: q.fileUrl2 || q.imgUrl2 || "",
        fileData1: fd1, fileName1: fn1, mimeType1: mt1,
        fileData2: fd2, fileName2: fn2, mimeType2: mt2,
        useAiGrading: document.getElementById('q-use-ai').checked
    };

    try {
        const result = await sendReliableRequest(payload);

        if (result.status === "Success") {
            payload.fileUrl1 = result.fileUrl1 || payload.fileUrl1;
            payload.fileUrl2 = result.fileUrl2 || payload.fileUrl2;
        }

        // ?´ë?ì§€ ?°ì´???œê±° (ìµœì ??
        delete payload.fileData1; delete payload.fileData2;
        delete payload.fileName1; delete payload.fileName2;
        delete payload.mimeType1; delete payload.mimeType2;

        const idx = globalConfig.questions.findIndex(item => item.id == id);
        if (idx !== -1) globalConfig.questions[idx] = { ...globalConfig.questions[idx], ...payload };
        save();
        saveConfigToCloud(); // [ìµœì ?? ë°±ê·¸?¼ìš´???™ê¸°??

        showToast("???˜ì • ?´ìš©???´ë¼?°ë“œ???±ê³µ?ìœ¼ë¡?ë°˜ì˜?˜ì—ˆ?µë‹ˆ??");
        fData1 = null; fData2 = null;
        changeTab('bank');
    } catch (e) {
        console.error("Critical Update Error:", e);
        showToast("???˜ì • ?¬í•­ ?„ì†¡ ?¤íŒ¨ (?¤íŠ¸?Œí¬ ?•ì¸)");
        btn.disabled = false;
        btn.innerText = "Update Question Info";
    }
}

// --- GEMINI AI INTEGRATION ---
// [Removed] callGeminiAPI êµ¬ë²„??(ì§ì ‘ API ?¸ì¶œ) ?? œ ??Proxy ë²„ì „(3997ì¤???ìµœì¢… ?ìš©??

// [New] AI ?ë™ ì±„ì  ?µì‹¬ ë¡œì§
async function gradeWithAI(q, userAns) {
    if (!userAns) return { score: 0, feedback: "?µì•ˆ???…ë ¥?˜ì? ?Šì•˜?µë‹ˆ??" };
    if (!globalConfig.geminiKey) return null; // Fallback

    // [Fix] ë¬¶ìŒ ì§€ë¬?+ ê°œë³„ ì§€ë¬¸ì„ AI?ê²Œ ?„ë‹¬?˜ì—¬ ë¬¸ë§¥ ?Œì•… ê°€?¥í•˜ê²???
    const bundleText = q.bundlePassageText || '';
    const passageText = q.passage1 || q.text || '';
    const fullContext = bundleText ? '[ë¬¶ìŒ ì§€ë¬?\n' + bundleText + '\n\n[ê°œë³„ ë¬¸í•­ ì§€ë¬?\n' + passageText : passageText;

    const prompt = `
[AI Online Grading Request]
 ë¬¸í•­: ${q.questionTitle || q.text}
 ? í˜•: ${q.questionType}
 ?ì—­: ${q.section}
 ?•ë‹µ/?¤ì›Œ?? ${q.answer}
 ëª¨ë²” ?µì•ˆ: ${q.modelAnswer || '?†ìŒ'}
 ?™ìƒ ?µì•ˆ: ${userAns}
 ë°°ì : ${q.score}
${fullContext ? ' ì§€ë¬?ë¬¸ë§¥):\n' + fullContext : ''}

[Instructions]
1. ??ì§€ë¬?ë¬¸ë§¥)??ë°˜ë“œ???½ê³ , ?™ìƒ???µì•ˆ??ë¹ˆì¹¸/ë¬¸ë§¥???Œë§?€ì§€ ?ë‹¨?˜ì„¸??
2. ?™ìƒ???µì•ˆ???•ë‹µ/ëª¨ë²” ?µì•ˆê³??˜ë??ìœ¼ë¡??¼ì¹˜?˜ëŠ”ì§€ ë¶„ì„?˜ì„¸??
3. [ì£¼ê???: ?¤í ë§ì´ ?½ê°„ ?€ë¦¬ê±°???™ì˜?´ë? ?¬ìš©?ˆë”?¼ë„ ?„ì²´?ì¸ ?˜ë?ê°€ ë§ë‹¤ë©??•ë‹µ(ë§Œì )?¼ë¡œ ?¸ì •?©ë‹ˆ?? ?„í¬?¤íŠ¸ë¡œí”¼?€ ë°±í‹±?€ ?™ì¼??ë¬¸ìë¡?ê°„ì£¼?˜ì„¸??
4. [?‘ë¬¸??: ë¬¸ë§¥, ë¬¸ë²•, ?µì‹¬ ?¨ì–´ ?¬í•¨ ?¬ë?ë¥?ì¢…í•© ?‰ê??˜ì—¬ 0?ì—??ë°°ì  ?¬ì´???ìˆ˜ë¥?ë¶€?¬í•˜?¸ìš”.
5. ì¶œë ¥?€ ë°˜ë“œ???„ë˜ JSON ?•ì‹?¼ë¡œë§??˜ì„¸?? (ê¸°í? ?ìŠ¤??ê¸ˆì?)

{"score": ?ìˆ˜?«ì, "feedback": "ê°„ëµ??ì±„ì  ê·¼ê±°(?œêµ­??"}
    `;

    try {
        const res = await callGeminiAPI(prompt, true); // Silent mode for batch
        if (!res) return null;
        const cleanRes = res.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanRes);
    } catch (e) {
        console.error("AI Grading Error:", e);
        return null;
    }
}

async function handleAIAnalyze() {
    const p1 = document.getElementById('q-p1').value;
    const p2 = document.getElementById('q-p2').value;
    const text = p1 + "\n" + p2;
    if (!text.trim()) return showToast("ë¶„ì„??ì§€ë¬??´ìš©???†ìŠµ?ˆë‹¤.");

    const prompt = `Analyze the following English text for an educational test item.
Text: "${text}"
Output ONLY a JSON object with these keys: "difficulty" (String one of: "ìµœìƒ", "??, "ì¤?, "??, "ê¸°ì´ˆ"), "keywords" (String comma separated), "category" (String best guess from "?£ê¸°(Listening)", "?…í•´(Reading)", "?´íœ˜(Vocabulary)", "ë¬¸ë²•(Grammar)").`;

    const res = await callGeminiAPI(prompt);
    if (!res) return;

    try {
        const clean = res.replace(/```json|```/g, '');
        const json = JSON.parse(clean);

        if (json.difficulty) document.getElementById('q-diff').value = json.difficulty;
        showToast(`??ë¶„ì„ ?„ë£Œ! ?œì´?? ${json.difficulty}, ?¤ì›Œ?? ${json.keywords}`);
    } catch (e) {
        showToast("AI ?‘ë‹µ ?´ì„ ?¤íŒ¨. ?¤ì‹œ ?œë„?´ì£¼?¸ìš”.");
    }
}

async function handleAISuggest() {
    const type = document.getElementById('q-type').value;
    const p1 = document.getElementById('q-p1').value;
    if (!p1) return showToast("ì§€ë¬?Passage 1)??ë¨¼ì? ?…ë ¥?´ì•¼ ?œì•ˆ?????ˆìŠµ?ˆë‹¤.");

    let prompt = "";
    if (type === 'choice') {
        prompt = `Based on the text below, create a multiple choice question.
Text: "${p1}"
Generate 1 correct answer and 4 plausible distractors.
Output ONLY a JSON object with keys: "answer" (String text of correct answer), "d1", "d2", "d3", "d4" (String texts of distractors).`;
    } else {
        prompt = `Based on the text below, suggest a model answer or key points for a ${type} question.
Text: "${p1}"
Output ONLY a JSON object with key: "answer" (String model answer).`;
    }

    const res = await callGeminiAPI(prompt);
    if (!res) return;

    try {
        const clean = res.replace(/```json|```/g, '');
        const json = JSON.parse(clean);

        if (type === 'choice') {
            // Randomize options
            const opts = [json.answer, json.d1, json.d2, json.d3, json.d4].sort(() => Math.random() - 0.5);
            const ansIdx = opts.indexOf(json.answer) + 1;

            // Fill UI
            document.getElementById('opt-cnt').value = 5;
            renderOptions(5);
            for (let i = 0; i < 5; i++) document.getElementById(`opt-${i}`).value = opts[i];
            document.getElementById('q-ans').value = ansIdx;
            showToast("??AIê°€ ë³´ê¸°ë¥??ì„±?ˆìŠµ?ˆë‹¤!");
        } else {
            document.getElementById('q-ans').value = json.answer;
            showToast("??AIê°€ ?ˆì‹œ ?µì•ˆ???ì„±?ˆìŠµ?ˆë‹¤!");
        }
    } catch (e) {
        console.error(e);
        showToast("AI ?‘ë‹µ ì²˜ë¦¬ ?¤íŒ¨");
    }
}

// --- V2 AI FUNCTIONS (Append) ---
async function handleAIAnalyzeV2() {
    const p1 = document.getElementById('q-p1').value;
    const p2 = document.getElementById('q-p2').value;
    const text = p1 + "\n" + p2;
    if (!text.trim()) return showToast("ë¶„ì„??ì§€ë¬??´ìš©???†ìŠµ?ˆë‹¤.");

    const sec = document.getElementById('q-sec').value;
    const subTypes = SUB_TYPE_MAP[sec] ? SUB_TYPE_MAP[sec].join(", ") : "ê¸°í?";

    const prompt = `Analyze the following English text for an educational test item.
Text: "${text}"
Context Section: "${sec}"
Available SubTypes: [${subTypes}]
Output ONLY a JSON object with these keys: 
"difficulty" (String one of: "ìµœìƒ", "??, "ì¤?, "??, "ê¸°ì´ˆ"), 
"keywords" (String comma separated), 
"subType" (String best match from Available SubTypes).`;

    const res = await callGeminiAPI(prompt);
    if (!res) return;

    try {
        const clean = res.replace(/```json|```/g, '');
        const json = JSON.parse(clean);

        if (json.difficulty) document.getElementById('q-diff').value = json.difficulty;
        if (json.keywords) document.getElementById('ai-keywords').value = json.keywords;
        if (json.subType) {
            const st = document.getElementById('q-det');
            const exists = Array.from(st.options).some(o => o.value === json.subType);
            if (exists) st.value = json.subType;
            else st.value = "(ë¯¸ë¶„ë¥?";
        }
        showToast(`??ë¶„ì„ ?„ë£Œ! ?œì´?? ${json.difficulty}`);
    } catch (e) {
        showToast("AI ?‘ë‹µ ?´ì„ ?¤íŒ¨. ?¤ì‹œ ?œë„?´ì£¼?¸ìš”.");
    }
}

async function handleAIPassageRefine() {
    const p1 = document.getElementById('q-p1').value;
    if (!p1) return showToast("?˜ì •??ì§€ë¬?Passage 1)???…ë ¥?´ì£¼?¸ìš”.");

    const prompt = `Refine the following English text to be more natural and grammatically correct for an educational test.
Text: "${p1}"
Output ONLY the refined text. Do not add any introduction or quotes.`;

    const res = await callGeminiAPI(prompt);
    if (res) {
        document.getElementById('ai-passage-view').value = res.trim();
        showToast("??AI ì§€ë¬??˜ì • ?„ë£Œ! ?œì•ˆ ?´ìš©???•ì¸?˜ì„¸??");
    }
}

async function handleAIAnswerSuggest() {
    const type = document.getElementById('q-type').value;
    const p1 = document.getElementById('q-p1').value;
    if (!p1) return showToast("ì§€ë¬?Passage 1)??ë¨¼ì? ?…ë ¥?´ì•¼ ?œì•ˆ?????ˆìŠµ?ˆë‹¤.");

    let prompt = "";
    if (type === 'choice') {
        prompt = `Based on the text below, create a multiple choice question.
Text: "${p1}"
Generate 1 correct answer and 4 plausible distractors.
Output ONLY a JSON object with keys: "answer" (String text of correct answer), "d1", "d2", "d3", "d4" (String texts of distractors).`;
    } else {
        prompt = `Based on the text below, suggest a model answer or key points for a ${type} question.
Text: "${p1}"
Output ONLY a JSON object with key: "answer" (String model answer).`;
    }

    const res = await callGeminiAPI(prompt);
    if (!res) return;

    try {
        const clean = res.replace(/```json|```/g, '');
        const json = JSON.parse(clean);

        let displayText = "";

        if (type === 'choice') {
            const opts = [json.answer, json.d1, json.d2, json.d3, json.d4].sort(() => Math.random() - 0.5);
            const ansIdx = opts.indexOf(json.answer) + 1;

            document.getElementById('opt-cnt').value = 5;
            renderOptions(5);
            for (let i = 0; i < 5; i++) document.getElementById(`opt-${i}`).value = opts[i];
            document.getElementById('q-ans').value = ansIdx;

            displayText = `[?•ë‹µ: ${ansIdx}ë²?(${json.answer})]\n\n?¤ë‹µ ë³´ê¸°:\n${opts.filter(o => o !== json.answer).join('\n')}`;
            showToast("??AIê°€ ë³´ê¸°ë¥??ì„±?ˆìŠµ?ˆë‹¤!");
        } else {
            document.getElementById('q-ans').value = json.answer;
            displayText = json.answer;
            showToast("??AIê°€ ?ˆì‹œ ?µì•ˆ???ì„±?ˆìŠµ?ˆë‹¤!");
        }
        document.getElementById('ai-answer-view').value = displayText;

    } catch (e) {
        console.error(e);
        showToast("AI ?‘ë‹µ ì²˜ë¦¬ ?¤íŒ¨");
    }
}

async function delQ(id) {
    const q = globalConfig.questions.find(item => item.id == id);
    if (!q) return;

    if (!confirm(`? ï¸ [ê²½ê³ ] ?•ë§ë¡??´ë‹¹ ë¬¸í•­???? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?\n\n?? œ ??ë¬¸í•­DB?€ ?°ë™??ëª¨ë“  ?•ë³´(?´ë?ì§€ ?¬í•¨)ê°€ ë³µê??˜ì? ?ŠìŠµ?ˆë‹¤. ?‘ê°™?€ ë¬¸í•­???ì„±?˜ë ¤ë©??˜ë™?¼ë¡œ ?¤ì‹œ ë¬¸í•­ ?ì„±???´ì•¼ ?©ë‹ˆ??`)) return;

    toggleLoading(true);
    try {
        // [New] ?´ë?ì§€ ?Œì¼ ID ì¶”ì¶œ ë¡œì§
        const getFileId = (url) => {
            if (!url) return null;
            let m = url.match(/id=([a-zA-Z0-9-_]+)/);
            if (m) return m[1];
            m = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (m) return m[1];
            return null;
        };

        const fileId1 = getFileId(q.fileUrl1);
        const fileId2 = getFileId(q.fileUrl2);

        // 1. ?„ìš© ë¬¸í•­DB ?œíŠ¸?ì„œ ???? œ (?œë²„ ?•ì¸ ê°•ì œ)
        const cat = globalConfig.categories.find(c => c.id === q.catId);
        const masterUrl = globalConfig.masterUrl || DEFAULT_MASTER_URL;
        if (cat && masterUrl) {
            const response = await fetch(masterUrl, {
                method: 'POST',
                body: JSON.stringify({
                    type: 'QUESTION_DELETE_INDEPENDENT',
                    parentFolderId: extractFolderId(cat.targetFolderUrl),
                    categoryName: cat.name,
                    id: q.id,
                    // [New] ?? œ???´ë?ì§€ ?Œì¼ ID ?„ë‹¬
                    fileId1: fileId1,
                    fileId2: fileId2
                })
            });
            const resultText = await response.text();
            console.log("Delete Response:", resultText);
        }

        // 2. ë¡œì»¬ ë©”ëª¨ë¦?ë°??¤ì • ?´ë¼?°ë“œ ê°±ì‹ 
        globalConfig.questions = globalConfig.questions.filter(item => item.id != id);
        save();
        await saveConfigToCloud();

        showToast("??ë¬¸í•­ ë°?ê´€???´ë?ì§€ê°€ ?´ë¼?°ë“œ DB?ì„œ ?êµ¬ ?? œ?˜ì—ˆ?µë‹ˆ??");
        changeTab('bank');
    } catch (err) {
        console.error(err);
        showToast("? ï¸ ?? œ ì²˜ë¦¬ ì¤??¤ë¥˜ ë°œìƒ");
    } finally {
        toggleLoading(false);
    }
}

// --- Drag & Drop Reordering Logic ---
let dragSrcEl = null;

function handleRowDragStart(e) {
    dragSrcEl = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    e.currentTarget.classList.add('bg-blue-100', 'opacity-50');
}

function handleRowDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleRowDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (dragSrcEl !== e.currentTarget) {
        const target = e.currentTarget;
        const sourceDataId = dragSrcEl.getAttribute('data-id');
        const targetDataId = target.getAttribute('data-id');

        // DOM Swap (Simple approach: swap data and content)
        const sourceInnerHTML = dragSrcEl.innerHTML;
        dragSrcEl.innerHTML = target.innerHTML;
        target.innerHTML = sourceInnerHTML;

        dragSrcEl.setAttribute('data-id', targetDataId);
        target.setAttribute('data-id', sourceDataId);

        showToast("?“ ?œì„œê°€ ë³€ê²½ë˜?ˆìŠµ?ˆë‹¤. '?œì„œ ?€?? ë²„íŠ¼???ŒëŸ¬ ?•ì •?˜ì„¸??");
    }
    return false;
}

function handleRowDragEnd(e) {
    e.currentTarget.classList.remove('bg-blue-100', 'opacity-50');
    // Refresh visuals (No. update)
    const rows = document.querySelectorAll('#bank-table-body tr');
    rows.forEach((row, idx) => {
        const noEl = row.querySelector('.font-mono');
        if (noEl) noEl.innerHTML = `<div class="flex items-center justify-center gap-2"><span class="text-[10px] opacity-30">??/span>${idx + 1}</div>`;
    });
}

// --- ë§ˆìŠ¤???¤ì •ì°?(?êµ¬ ë³´ì¡´ ì£¼ì†Œ) ---
function renderMainConfig(c) {
    setCanvasId('11');
    c.innerHTML = `
        <div class="animate-fade-in-safe space-y-12 pb-20 text-left mt-5">

            <!-- ===== Row 1: Security & Identity + Server Infrastructure (2-col) ===== -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                <!-- Security & Identity (Admin + Master in ONE card) -->
                <div>
                    <h3 class="fs-24 text-slate-800 font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                        <span class="bg-slate-200 p-2 rounded-lg text-2xl">?”</span> Security &amp; Identity
                    </h3>
                    <div class="card !bg-white border-2 border-slate-200 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-xl space-y-0 relative overflow-hidden group">
                        <!-- Admin Code -->
                        <div class="space-y-2 relative overflow-hidden">
                            <div class="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"><span class="text-7xl">?›¡ï¸?/span></div>
                            <h4 class="fs-16 text-[#013976] font-bold uppercase">Admin Access Code</h4>
                            <p class="fs-14 text-slate-400">ê´€ë¦¬ì ëª¨ë“œ ?‘ì† ë¹„ë?ë²ˆí˜¸</p>
                            <div class="flex gap-3 items-center">
                                <input type="password" id="admin-code-input" class="ys-field flex-grow fs-20 font-black text-[#013976] tracking-widest text-center" value="${globalConfig.adminCode || '1111'}" placeholder="CODE">
                                <button onclick="(async()=>{if(!confirm('?’¾ ê´€ë¦¬ì ì½”ë“œë¥?ë³€ê²½í•˜?œê² ?µë‹ˆê¹?')) return; const v=document.getElementById('admin-code-input').value; if(v){globalConfig.adminCode=v; save(); await saveConfigToCloud(); showToast('??ê´€ë¦¬ì ì½”ë“œê°€ ë³€ê²½ë˜?ˆìŠµ?ˆë‹¤.');}else{showToast('? ï¸ ? íš¨??ì½”ë“œë¥??…ë ¥?˜ì„¸??);}})()"
                                        class="bg-[#013976] text-white px-6 py-3 rounded-xl fs-14 font-bold hover:bg-blue-800 transition-all active:scale-95 whitespace-nowrap shadow-md flex-none">SAVE</button>
                            </div>
                        </div>
                        <div class="border-t border-slate-100"></div>
                        <!-- Master Code -->
                        <div class="space-y-2 relative overflow-hidden">
                            <div class="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"><span class="text-7xl">?‘‘</span></div>
                            <h4 class="fs-16 text-indigo-700 font-bold uppercase">Master Access Code</h4>
                            <p class="fs-14 text-slate-400">ìµœê³  ê´€ë¦¬ì ?‘ì† ë¹„ë?ë²ˆí˜¸</p>
                            <div class="flex gap-3 items-center">
                                <input type="password" id="master-code-input" class="ys-field flex-grow fs-20 font-black text-indigo-700 tracking-widest text-center" value="${globalConfig.masterCode || '0000'}" placeholder="CODE">
                                <button onclick="(async()=>{if(!confirm('?’¾ ë§ˆìŠ¤??ì½”ë“œë¥?ë³€ê²½í•˜?œê² ?µë‹ˆê¹?')) return; const v=document.getElementById('master-code-input').value; if(v){globalConfig.masterCode=v; save(); await saveConfigToCloud(); showToast('??ë§ˆìŠ¤??ì½”ë“œê°€ ë³€ê²½ë˜?ˆìŠµ?ˆë‹¤.');}else{showToast('? ï¸ ? íš¨??ì½”ë“œë¥??…ë ¥?˜ì„¸??);}})()"
                                        class="bg-indigo-600 text-white px-6 py-3 rounded-xl fs-14 font-bold hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap shadow-md flex-none">SAVE</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Server Infrastructure (Apps Script + Main Folder in ONE card) -->
                <div>
                    <h3 class="fs-24 text-slate-800 font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                        <span class="bg-blue-100 p-2 rounded-lg text-2xl">?Œ©ï¸?/span> Server Infrastructure
                    </h3>
                    <div class="card !bg-white border-2 border-blue-100 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-xl space-y-0 relative overflow-hidden group">
                        <!-- Apps Script Hub -->
                        <div class="space-y-2 relative overflow-hidden">
                            <div class="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"><span class="text-7xl">?™ï¸</span></div>
                            <h4 class="fs-16 text-indigo-700 font-bold uppercase">Apps Script Hub</h4>
                            <p class="fs-14 text-slate-500">Google Apps Script Web App URL</p>
                            <div class="flex gap-3 items-center">
                                <input type="text" id="m-url" autocomplete="off" class="ys-field flex-grow font-mono min-w-0" value="${globalConfig.masterUrl || ''}" placeholder="https://script.google.com/macros/s/...">
                                <button onclick="(async()=>{if(!confirm('?’¾ ë§ˆìŠ¤???±í¬ ì£¼ì†Œë¥?ë³€ê²½í•˜?œê² ?µë‹ˆê¹?')) return; const mVal=document.getElementById('m-url').value; globalConfig.masterUrl=mVal; save(); await saveConfigToCloud(); showToast('??ë§ˆìŠ¤??ì£¼ì†Œê°€ ?…ë°?´íŠ¸?˜ì—ˆ?µë‹ˆ??');})()"
                                        class="bg-indigo-600 text-white px-6 py-3 rounded-xl fs-14 font-bold hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap shadow-md flex-none">SAVE</button>
                            </div>
                        </div>
                        <div class="border-t border-slate-100"></div>
                        <!-- Main Server Folder -->
                        <div class="space-y-2 relative overflow-hidden">
                            <div class="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"><span class="text-7xl">?“‚</span></div>
                            <h4 class="fs-16 text-blue-700 font-bold uppercase">Main Server Folder</h4>
                            <p class="fs-14 text-slate-500">Google Drive Root Folder URL</p>
                            <div class="flex gap-3 items-center">
                                <input type="text" id="main-server-folder" autocomplete="off" class="ys-field flex-grow font-mono min-w-0" value="${globalConfig.mainServerLink || ''}" placeholder="https://drive.google.com/drive/folders/...">
                                <button onclick="(async()=>{const val=document.getElementById('main-server-folder').value; globalConfig.mainServerLink=val; save(); await saveConfigToCloud(); showToast('??ë©”ì¸ ?œë²„ ?´ë”ê°€ ?°ê²°?˜ì—ˆ?µë‹ˆ??');})()"
                                        class="bg-blue-600 text-white px-6 py-3 rounded-xl fs-14 font-bold hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap shadow-md flex-none">SAVE</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===== Row 2: Class Management + Intelligence Engine (2-col) ===== -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                <!-- Class Management -->
                <div>
                    <h3 class="fs-24 text-slate-800 font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                        <span class="bg-green-100 p-2 rounded-lg text-2xl">?«</span> Class Management
                    </h3>
                    <div class="card !bg-white border-2 border-green-200 hover:border-green-500 transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"><span class="text-9xl">?«</span></div>
                        <div class="flex flex-col gap-4">
                            <!-- ?œëª© -->
                            <div>
                                <h4 class="fs-18 text-green-700 font-bold uppercase mb-1">Class Registration</h4>
                                <p class="fs-14 text-slate-500">?™ë…„ë³„ë¡œ ?™ê¸‰???±ë¡?˜ì„¸?? ?™ë…„ ? íƒ ???´ë‹¹ ?™ê¸‰ë§??…ë ¥ ?”ë©´???œì‹œ?©ë‹ˆ??</p>
                            </div>
                            <!-- ?…ë ¥ ?? ?™ë…„ + ?™ê¸‰ëª?+ ì¶”ê? + SAVE -->
                            <div class="flex gap-2 items-center">
                                <select id="new-class-grade" class="ys-field !w-32 flex-none">
                                    <option value="">? íƒ</option>
                                    <option value="ì´?">ì´?</option><option value="ì´?">ì´?</option><option value="ì´?">ì´?</option>
                                    <option value="ì´?">ì´?</option><option value="ì´?">ì´?</option><option value="ì´?">ì´?</option>
                                    <option value="ì¤?">ì¤?</option><option value="ì¤?">ì¤?</option><option value="ì¤?">ì¤?</option>
                                    <option value="ê³?">ê³?</option><option value="ê³?">ê³?</option><option value="ê³?">ê³?</option>
                                </select>
                                <input type="text" id="new-class-input" class="ys-field !w-auto flex-grow min-w-0" placeholder="?? Aë°? ?ì–´ë°? autocomplete="off" onkeydown="if(event.key==='Enter') addClassItem()">
                                <button onclick="addClassItem()" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl fs-14 font-bold shadow-md transition-all active:scale-95 whitespace-nowrap flex-none">+ ì¶”ê?</button>
                                <button onclick="saveClassConfig()" class="bg-[#013976] hover:bg-[#002855] text-white px-6 py-3 rounded-xl fs-14 font-bold shadow-md transition-all active:scale-95 whitespace-nowrap flex-none">SAVE</button>
                            </div>
                            <!-- ?±ë¡ ?™ê¸‰ ëª©ë¡ -->
                            <div id="class-list" class="space-y-2 min-h-[44px] bg-slate-50 rounded-xl p-3 border border-slate-200">
                                ${renderClassListHtml()}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Intelligence Engine -->
                <div>
                    <h3 class="fs-24 text-slate-800 font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                        <span class="bg-purple-100 p-2 rounded-lg text-2xl">??/span> Intelligence Engine
                    </h3>
                    <div class="card !bg-white border-2 border-purple-200 hover:border-purple-500 transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"><span class="text-9xl">??/span></div>
                        <div class="flex flex-col gap-4 relative z-10">
                            <div>
                                <h4 class="fs-18 text-purple-700 font-bold uppercase mb-1">Gemini AI API Key</h4>
                                <p class="fs-14 text-slate-500">AI ë¬¸í•­ ë¶„ì„ ë°??ë™ ?ì„± ê¸°ëŠ¥???„í•œ ?¸ì¦ ??/p>
                            </div>
                            <div class="flex gap-3 items-center">
                                <input type="password" id="g-key" autocomplete="off" class="ys-field !bg-slate-50 !text-purple-900 border-slate-200 focus:border-purple-500 font-mono flex-grow" value="${globalConfig.geminiKey || ''}" placeholder="AI Studio Key">
                                <a href="https://aistudio.google.com/app/apikey" target="_blank"
                                   class="py-3 px-5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center gap-2 hover:bg-purple-100 transition-all no-underline whitespace-nowrap flex-none">
                                    <span class="fs-14 font-bold text-purple-700">?”‘ GET KEY</span>
                                </a>
                                <button onclick="(async()=>{if(!confirm('?’¾ API Keyë¥??€?¥í•˜?œê² ?µë‹ˆê¹?')) return; const gVal=document.getElementById('g-key').value; globalConfig.geminiKey=gVal; save(); await saveConfigToCloud(); showToast('??Gemini Keyê°€ ?€?¥ë˜?ˆìŠµ?ˆë‹¤.');})()"
                                        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl fs-14 font-bold shadow-md transition-all active:scale-95 whitespace-nowrap flex-none">SAVE</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===== Row 3: Academy Branding (full width) ===== -->
            <div>
                <h3 class="fs-24 text-slate-800 font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                    <span class="bg-pink-100 p-2 rounded-lg text-2xl">?¨</span> Academy Branding
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Logo Config -->
                    <div class="space-y-3">
                        <label class="ys-label font-bold text-slate-600 block">School Logo (Main)</label>
                        <div id="pv-logo" class="h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group hover:border-[#013976] transition-all">
                             ${getSafeImageUrl(globalConfig.logo) ? `<img src="${getSafeImageUrl(globalConfig.logo)}" class="max-h-full p-6 object-contain filter drop-shadow-sm">` : '<span class="text-slate-400 font-medium">No Logo Uploaded</span>'}
                             <div class="absolute inset-0 bg-[#013976]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <label for="l-in" class="cursor-pointer text-white font-bold border-2 border-white px-6 py-3 rounded-full hover:bg-white hover:text-[#013976] transition-all transform scale-90 group-hover:scale-100 duration-300">Upload Image</label>
                             </div>
                        </div>
                        <input type="file" onchange="upAs(event, 'logo')" class="hidden" id="l-in" accept="image/*">
                    </div>
                    <!-- Banner Config -->
                    <div class="space-y-3">
                        <label class="ys-label font-bold text-slate-600 block">Report Banner (Top)</label>
                        <div id="pv-banner" class="h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group hover:border-[#013976] transition-all">
                             ${getSafeImageUrl(globalConfig.banner) ? `<img src="${getSafeImageUrl(globalConfig.banner)}" class="max-h-full p-2 object-contain">` : '<span class="text-slate-400 font-medium">No Banner Uploaded</span>'}
                             <div class="absolute inset-0 bg-[#013976]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <label for="b-in" class="cursor-pointer text-white font-bold border-2 border-white px-6 py-3 rounded-full hover:bg-white hover:text-[#013976] transition-all transform scale-90 group-hover:scale-100 duration-300">Upload Image</label>
                             </div>
                        </div>
                        <input type="file" onchange="upAs(event, 'banner')" class="hidden" id="b-in" accept="image/*">
                    </div>
                </div>
            </div>

        </div>`
}

// ?™ê¸‰ ëª©ë¡ HTML ?Œë”ë§?(?™ë…„ë³?ê·¸ë£¹)
function renderClassListHtml() {
    const classes = (globalConfig.classes || []).filter(c => typeof c === 'object' && c.grade && c.name);
    if (classes.length === 0) return '<span class="text-slate-400 fs-14">?±ë¡???™ê¸‰???†ìŠµ?ˆë‹¤.</span>';
    const GRADES = ['ì´?','ì´?','ì´?','ì´?','ì´?','ì´?','ì¤?','ì¤?','ì¤?','ê³?','ê³?','ê³?'];
    const groups = {};
    classes.forEach((c, i) => { if (!groups[c.grade]) groups[c.grade] = []; groups[c.grade].push({...c, idx: i}); });
    return GRADES.filter(g => groups[g])
        .map(g => `
        <div class="flex items-center gap-2 flex-wrap py-1">
            <span class="fs-14 font-bold text-slate-500 w-8">${g}</span>
            ${groups[g].map(c => `<span class="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-1 rounded-full fs-14 font-bold">${c.name}<button onclick="removeClassItem(${c.idx})" class="text-green-600 hover:text-red-500 font-black ml-1">Ã—</button></span>`).join('')}
        </div>`).join('');
}

// getClassesForGrade: ?´ë‹¹ ?™ë…„???™ê¸‰ ëª©ë¡ ë°˜í™˜
function getClassesForGrade(grade) {
    if (!grade || !globalConfig.classes) return [];
    return (globalConfig.classes)
        .filter(c => typeof c === 'object' && c.grade === grade)
        .map(c => c.name);
}

function addClassItem() {
    const gradeEl = document.getElementById('new-class-grade');
    const inp = document.getElementById('new-class-input');
    const grade = gradeEl?.value;
    const name  = inp?.value.trim();
    if (!grade) { showToast('?™ë…„??? íƒ?˜ì„¸??); return; }
    if (!name)  { showToast('?™ê¸‰ëª…ì„ ?…ë ¥?˜ì„¸??); return; }
    if (!globalConfig.classes) globalConfig.classes = [];
    // ì¤‘ë³µ ?•ì¸
    if (globalConfig.classes.some(c => typeof c === 'object' && c.grade === grade && c.name === name)) {
        showToast('?´ë? ?±ë¡???™ê¸‰?…ë‹ˆ??); return;
    }
    globalConfig.classes.push({ grade, name });
    inp.value = '';
    const listEl = document.getElementById('class-list');
    if (listEl) listEl.innerHTML = renderClassListHtml();
}

function removeClassItem(idx) {
    if (!globalConfig.classes) return;
    globalConfig.classes.splice(idx, 1);
    const listEl = document.getElementById('class-list');
    if (listEl) listEl.innerHTML = renderClassListHtml();
}

async function saveClassConfig() {
    save();
    await saveConfigToCloud();
    showToast('???™ê¸‰ ëª©ë¡???€?¥ë˜?ˆìŠµ?ˆë‹¤.');
}

// --- ì¹´í…Œê³ ë¦¬ ê´€ë¦?ë³„ë„ ë·?---
// ?€?€?€ ?™ìƒ DB ë·°ì–´ (Canvas 09-3) ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
let _sdbSort  = { col: 'name', dir: 1 };  // col: name|grade|year|md|score
let _sdbCache = { catId: '', catName: '', records: [] };
let _sdbList  = [];   // ?„í„° ?ìš©???„ì¬ ëª©ë¡

async function showStudentDBViewer(catId, catName) {
    const cat = globalConfig.categories.find(c => c.id === catId);
    if (!cat) return;
    const c = document.getElementById('dynamic-content');
    setCanvasId('09-3');

    _sdbCache = { catId, catName, records: [] };
    _sdbSort  = { col: 'name', dir: 1 };
    _sdbList  = [];

    const bSty = `background:linear-gradient(135deg,#fff 0%,#eef4ff 100%);border:2px solid rgba(1,57,118,0.15);`;
    const tBar = `<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#60a5fa,#6366f1,#a855f7);"></div>`;

    c.innerHTML = `
    <div class="animate-fade-in-safe space-y-5 pb-10">
        <!-- ?¤ë”: ?œëª©ë§?-->
        <div class="flex justify-between items-center">
            <h2 class="fs-32 text-[#013976] leading-none font-black uppercase !border-none !pb-0">${catName} ???™ìƒ DB</h2>
        </div>

        <!-- ?„í„° ë°?-->
        <div class="card !py-3.5 !px-6 flex flex-row items-center justify-between shadow-lg relative overflow-hidden flex-none gap-4 flex-nowrap" style="${bSty}">
            ${tBar}
            <div class="flex items-center gap-4 flex-grow">
                <span style="font-size:17px;font-weight:700;color:#013976;white-space:nowrap;">?“… ?‘ì‹œ?„ë„</span>
                <select id="sdb-year" class="ys-field flex-grow !text-[16px] !font-normal !bg-white">
                    <option value="?„ì²´">?„ì²´</option>
                </select>
                <span style="font-size:17px;font-weight:700;color:#013976;white-space:nowrap;">?“ ?™ë…„</span>
                <select id="sdb-grade" class="ys-field flex-grow !text-[16px] !font-normal !bg-white">
                    <option value="?„ì²´">?„ì²´</option>
                </select>
            </div>
            <button onclick="applyStudentDBFilters()" class="btn-ys !bg-[#013976] !text-white !border-[#013976] hover:brightness-110 !px-5 !py-2.5 !text-[15px] !font-black rounded-xl shadow-md whitespace-nowrap flex-shrink-0 flex items-center gap-2">?” ?•ì¸</button>
            <span id="sdb-count" class="whitespace-nowrap" style="font-size:16px; font-weight:700; color:#a855f7;"></span>
        </div>

        <!-- ?Œì´ë¸??ì—­ -->
        <div class="card !p-0 overflow-hidden shadow-sm">
            <div id="sdb-table-wrap"><p class="text-slate-400 text-center py-10">ë¶ˆëŸ¬?¤ëŠ” ì¤?..</p></div>
        </div>
    </div>`;

    toggleLoading(true);
    try {
        const folderId = extractFolderId(cat.targetFolderUrl);
        const res = await sendReliableRequest({ type: 'GET_STUDENT_LIST', parentFolderId: folderId, categoryName: cat.name });
        const rawList = res.data || [];
        _sdbCache.records = rawList;

        // ?„í„° ?œë¡­?¤ìš´ ì±„ìš°ê¸?
        const years  = [...new Set(rawList.map(r => String(r['?‘ì‹œ??]||r.date||'').substring(0,4)).filter(y => /^\d{4}$/.test(y)))].sort((a,b) => b.localeCompare(a));
        const grades = [...new Set(rawList.map(r => String(r['?™ë…„']||r.grade||'')).filter(g => g))].sort((a,b) => a.localeCompare(b,'ko'));
        const ySel = document.getElementById('sdb-year');
        const gSel = document.getElementById('sdb-grade');
        if (ySel) ySel.innerHTML = '<option value="?„ì²´">?„ì²´</option>' + years.map(y  => `<option value="${y}">${y}??/option>`).join('');
        if (gSel) gSel.innerHTML = '<option value="?„ì²´">?„ì²´</option>' + grades.map(g => `<option value="${g}">${g}</option>`).join('');

        applyStudentDBFilters();
    } catch(e) {
        const w = document.getElementById('sdb-table-wrap');
        if (w) w.innerHTML = `<p class="text-red-400 text-center py-6">?¤ë¥˜: ${e.message}</p>`;
    } finally { toggleLoading(false); }
}

// ?„í„° ?ìš© ???Œì´ë¸??¬ë Œ?”ë§
function applyStudentDBFilters() {
    const year  = document.getElementById('sdb-year')?.value  || '?„ì²´';
    const grade = document.getElementById('sdb-grade')?.value || '?„ì²´';
    let list = (_sdbCache.records || []).slice();
    if (year  !== '?„ì²´') list = list.filter(r => String(r['?‘ì‹œ??]||r.date||'').substring(0,4) === year);
    if (grade !== '?„ì²´') list = list.filter(r => String(r['?™ë…„']||r.grade||'') === grade);
    _sdbList = list;
    _renderStudentDBTable();
}

// ì»¬ëŸ¼ ?¤ë” ?´ë¦­ ?•ë ¬
function sortStudentDB(col) {
    _sdbSort.dir = (_sdbSort.col === col) ? _sdbSort.dir * -1 : 1;
    _sdbSort.col = col;
    _renderStudentDBTable();
}

// ?Œì´ë¸??Œë”ë§?
function _renderStudentDBTable() {
    const { col, dir } = _sdbSort;
    const catId = _sdbCache.catId;
    const sorted = _sdbList.slice().sort((a, b) => {
        const dA = String(a['?‘ì‹œ??]||a.date||''), dB = String(b['?‘ì‹œ??]||b.date||'');
        switch(col) {
            case 'name':  return dir * String(a['?™ìƒëª?]||a.name||'').localeCompare(String(b['?™ìƒëª?]||b.name||''), 'ko');
            case 'grade': return dir * String(a['?™ë…„']||a.grade||'').localeCompare(String(b['?™ë…„']||b.grade||''), 'ko');
            case 'year':  return dir * dA.substring(0,4).localeCompare(dB.substring(0,4));
            case 'md':    return dir * dA.substring(5).localeCompare(dB.substring(5));
            case 'score': return dir * ((parseFloat(a['ì´ì ']??a.totalScore??0)||0) - (parseFloat(b['ì´ì ']??b.totalScore??0)||0));
            default: return 0;
        }
    });

    const cnt = document.getElementById('sdb-count');
    if (cnt) cnt.textContent = `ì´?${sorted.length}ëª?;
    const wrap = document.getElementById('sdb-table-wrap');
    if (!wrap) return;

    if (sorted.length === 0) {
        wrap.innerHTML = '<p class="text-slate-400 text-center py-10">?´ë‹¹ ì¡°ê±´???™ìƒ???†ìŠµ?ˆë‹¤.</p>';
        return;
    }

    const arw = c => col === c ? (dir === 1 ? ' ?? : ' ??) : ' <span class="opacity-30">??/span>';
    const th = (c, lbl) => `<th class="cursor-pointer select-none hover:bg-[#012a5e] transition-colors text-left px-4 py-3 font-black text-white fs-15" onclick="sortStudentDB('${c}')">${lbl}${arw(c)}</th>`;
    wrap.innerHTML = `
    <table class="w-full border-collapse">
        <thead>
            <tr class="bg-[#013976]">
                ${th('name','?´ë¦„')}${th('grade','?™ë…„')}${th('year','?‘ì‹œ?„ë„')}${th('md','?‘ì‹œ?”ì¼')}${th('score','?ìˆ˜')}
                <th class="px-4 py-3 text-white fs-15 font-black text-center">?? œ</th>
            </tr>
        </thead>
        <tbody>
            ${sorted.map((s, i) => {
                const sid   = s['?™ìƒID']||s.id||'';
                const name  = s['?™ìƒëª?]||s.name||'-';
                const grade = s['?™ë…„']||s.grade||'-';
                const _rawDate = String(s['?‘ì‹œ??]||s.date||'-');
                const full = (() => {
                    if (!_rawDate || _rawDate === '-') return '-';
                    if (_rawDate.includes('T')) {
                        // GASê°€ UTC ISO ?•ì‹?¼ë¡œ ë°˜í™˜ ??ë¡œì»¬ timezone ê¸°ì??¼ë¡œ ë³€??(UTC?’KST ? ì§œ ë¶ˆì¼ì¹?ë°©ì?)
                        const d = new Date(_rawDate);
                        const y = d.getFullYear();
                        const m = String(d.getMonth()+1).padStart(2,'0');
                        const dy = String(d.getDate()).padStart(2,'0');
                        return `${y}-${m}-${dy}`;
                    }
                    return _rawDate.substring(0,10);
                })();
                const yr    = full.length >= 4 ? full.substring(0,4) : '-';
                const md    = full.length >= 10 ? full.substring(5)   : '-';
                const score = s['ì´ì '] ?? s.totalScore ?? '-';
                const max   = s['ë§Œì '] ?? s.maxScore ?? '';
                const row   = i % 2 === 0 ? 'bg-white' : 'bg-slate-50';
                return `<tr class="${row} hover:bg-blue-50 transition-colors border-b border-slate-100">
                    <td class="px-4 py-3 font-bold text-[#013976] fs-15">${name}</td>
                    <td class="px-4 py-3 text-slate-700 fs-15">${grade}</td>
                    <td class="px-4 py-3 text-slate-600 fs-15">${yr}</td>
                    <td class="px-4 py-3 text-slate-600 fs-15">${md}</td>
                    <td class="px-4 py-3 font-bold text-slate-800 fs-15">${score}${max?'/'+max:''}</td>
                    <td class="px-4 py-3 text-center">
                        <button onclick="deleteStudentRecord('${catId}','${sid}','${name}')" class="text-red-500 hover:text-red-700 fs-13 font-bold px-3 py-1 rounded-lg border border-red-200 hover:bg-red-50">?—‘ï¸??? œ</button>
                    </td>
                </tr>`;
            }).join('')}
        </tbody>
    </table>`;
}

async function deleteStudentRecord(catId, studentId, studentName) {
    if (!confirm(`? ï¸ [${studentName}] ?™ìƒ???±ì  ?°ì´?°ë? ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?\n\n???‘ì—…?€ ?˜ëŒë¦????†ìŠµ?ˆë‹¤.`)) return;
    const cat = globalConfig.categories.find(c => c.id === catId);
    if (!cat) return;
    toggleLoading(true);
    try {
        const folderId = extractFolderId(cat.targetFolderUrl);
        await sendReliableRequest({ type: 'DELETE_STUDENT', parentFolderId: folderId, studentId });
        showToast(`??${studentName} ?°ì´???? œ ?„ë£Œ`);
        showStudentDBViewer(catId, cat.name);
    } catch(e) { showToast('???? œ ?¤íŒ¨: ' + e.message); }
    finally { toggleLoading(false); }
}

function renderCatManage(c) {
    setCanvasId('09');
    c.innerHTML = `
        <div class="animate-fade-in-safe flex flex-col h-full space-y-6">
            <h2 class="fs-32 text-[#013976] leading-none font-black uppercase !border-none !pb-0">Exam Paper Management</h2>

            <!-- ?ë‹¨ ?¤ë” ë°?(ìº”ë²„??8 ?¤í??? -->
            <div class="card !p-6 flex flex-row items-center justify-between shadow-lg relative overflow-hidden flex-none gap-4 flex-nowrap" style="background: linear-gradient(135deg, #ffffff 0%, #eef4ff 100%); border: 2px solid rgba(1,57,118,0.15);">
                <div style="position:absolute; top:0; left:0; right:0; height:3px; background: linear-gradient(90deg, #60a5fa, #6366f1, #a855f7);"></div>
                <div class="flex items-center gap-4 flex-grow">
                    <label class="ys-label !mb-0 whitespace-nowrap !text-[#013976] font-bold">?“‚ ?œí—˜ì§€ ëª©ë¡</label>
                </div>
                <button onclick="showCat()" class="btn-ys !bg-[#013976] !text-white !border-[#013976] hover:brightness-110 !px-5 !py-2.5 !text-[15px] !font-black rounded-xl shadow-md whitespace-nowrap flex-shrink-0 flex items-center gap-2">
                    ??NEW EXAM PAPER
                </button>
            </div>

            <!-- ?œí—˜ì§€ ëª©ë¡ ì»¨í…Œ?´ë„ˆ (ìº”ë²„??8 ?¤í??? -->
            <div class="flex-grow overflow-auto bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm p-4 space-y-3">
                ${globalConfig.categories.length === 0
                    ? `<div class="p-20 text-center text-slate-400">?“­ ?±ë¡???œí—˜ì§€ê°€ ?†ìŠµ?ˆë‹¤. NEW ë²„íŠ¼?¼ë¡œ ì¶”ê??˜ì„¸??</div>`
                    : globalConfig.categories.map(cat => `
                        <div class="flex justify-between items-center bg-slate-50 px-6 py-4 rounded-xl border-2 border-slate-200 hover:shadow-md hover:bg-white hover:border-blue-300 transition-all">
                            <div class="text-[#013976] fs-18 font-bold">${cat.name}</div>
                                                    <div class="flex items-center gap-4">
                                <button onclick="editCat('${cat.id}')" class="fs-18 text-blue-600 hover:text-blue-800">?ï¸ ?˜ì •</button>
                                <span class="text-slate-300">|</span>
                                <button onclick="showStudentDBViewer('${cat.id}', '${cat.name}')" class="fs-18 text-purple-600 hover:text-purple-800">?“‹ ?™ìƒ DB</button>
                                <span class="text-slate-300">|</span>
                                <button onclick="delCat('${cat.id}')" class="fs-18 text-red-500 underline hover:text-red-700">?—‘ï¸??? œ</button>
                            </div>
                        </div>`).join('')}
            </div>
        </div>`;
}

function showCat(editId = null) {
    const c = document.getElementById('dynamic-content');
    setCanvasId(editId ? '09-2' : '09-1');
    const isEdit = !!editId;
    const cat = isEdit ? globalConfig.categories.find(c => c.id === editId) : null;
    const title = isEdit ? "EDIT EXAM PAPER" : "NEW EXAM PAPER";
    const btnText = isEdit ? "?’¾ ë³€ê²½ì‚¬???€?? : "?? ? ê·œ ?ì„± ë°??€??;

    const classificationOptions = [
        { name: "?±ë¡ ì§„ë‹¨ì§€ (A)", code: "A" },
        { name: "ì´ˆë“± ?‰ê?ì§€ (B)", code: "B" },
        { name: "ì¤? ?‰ê?ì§€ (C)", code: "C" },
        { name: "ì¤? ?‰ê?ì§€ (D)", code: "D" },
        { name: "ì¤? ?‰ê?ì§€ (E)", code: "E" },
        { name: "ê³ ë“± ?‰ê?ì§€ (F)", code: "F" }
    ].map(opt => `<option value="${opt.code}" ${cat?.classification === opt.code ? 'selected' : ''}>${opt.name}</option>`).join('');

    const dateReadonly = isEdit ? 'readonly' : '';
    const dateClass = isEdit ? 'bg-slate-100 cursor-not-allowed opacity-75' : '';
    const classDisabled = isEdit ? 'disabled' : '';
    const classStyle = isEdit ? 'bg-slate-100 cursor-not-allowed opacity-75' : '';

    // Auto-generate YYMM for new category
    let defaultYm = cat?.createdDate || '';
    if (!isEdit) {
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        defaultYm = yy + mm;
    }

    c.innerHTML = `
        <div class="animate-fade-in-safe flex flex-col items-center pb-10 mt-5">
            <div class="canvas-premium-box !max-w-3xl w-full">
                <div class="flex flex-row items-start gap-10">

                    <!-- ì¢Œì¸¡: ?„ì´ì½?+ ?œëª© -->
                    <div class="flex flex-col items-center gap-4 flex-shrink-0 w-40 border-r border-slate-200 pr-10">
                        <div class="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner relative z-10 unified-animate">
                            ?“‚
                            <div class="absolute inset-0 bg-blue-100/30 rounded-full blur-2xl opacity-50 scale-150 -z-10"></div>
                        </div>
                        <h2 class="fs-18 text-[#013976] uppercase text-center font-black tracking-tight leading-tight">${title}</h2>
                    </div>

                    <!-- ?°ì¸¡: ??-->
                    <div class="flex-1 space-y-4 text-left">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="ys-label font-bold !mb-0">?·ï¸?êµ¬ë¶„</label>
                                <select id="cc" class="ys-field !bg-slate-50/50 hover:border-blue-400 focus:bg-white transition-all shadow-sm ${classStyle}" ${classDisabled}>
                                    ${classificationOptions}
                                </select>
                            </div>
                            <div class="space-y-2">
                                <label class="ys-label font-bold !mb-0">?“… ?ì„±?„ì›”</label>
                                <input type="text" id="cd" autocomplete="off" class="ys-field !bg-slate-50/50 focus:bg-white transition-all shadow-sm ${dateClass}"
                                       placeholder="?? 2602" value="${defaultYm}" maxlength="4" ${dateReadonly}>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="ys-label font-bold !mb-0">?“ ê¶Œì¥ ?‰ê? ?™ë…„</label>
                                <select id="cgr" class="ys-field !bg-slate-50/50 hover:border-blue-400 focus:bg-white transition-all shadow-sm">
                                    <option value="" disabled ${!cat?.targetGrade ? 'selected' : ''} hidden>? íƒ (? íƒ?¬í•­)</option>
                                    ${['ì´ˆë“±', 'ì¤?', 'ì¤?', 'ì¤?', 'ê³ ë“±'].map(g => `<option value="${g}" ${cat?.targetGrade === g ? 'selected' : ''}>${g}</option>`).join('')}
                                </select>
                            </div>
                            <div class="space-y-2">
                                <label class="ys-label font-bold !mb-0">?±ï¸ ê¶Œì¥ ?‰ê? ?œê°„ (ë¶?</label>
                                <input type="number" id="ctm" class="ys-field !bg-slate-50/50 focus:bg-white transition-all shadow-sm" placeholder="0 = ë¬´ì œ?? value="${cat?.timeLimit || 0}" min="0">
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="ys-label font-bold !mb-0">?“ ?œí—˜ì§€ ?´ë¦„</label>
                            <input type="text" id="cn" autocomplete="off" class="ys-field !bg-slate-50/50 focus:bg-white transition-all shadow-sm"
                                   placeholder="?œí—˜ì§€ ?´ë¦„???…ë ¥?˜ì„¸??" value="${cat?.name || ''}">
                        </div>

                        ${isEdit ? '<p class="text-xs text-slate-500 text-center font-medium mt-1">? ï¸ ?´ë¦„/?œê°„/?™ë…„ ?•ë³´ë§??˜ì • ê°€?¥í•©?ˆë‹¤.</p>' : ''}

                        <div>
                            <button onclick="saveCat('${editId || ''}')" class="btn-ys w-full !py-4 fs-16 font-bold transition-all active:scale-95 shadow-lg mt-2">
                                ${btnText}
                            </button>
                            <button onclick="changeTab('cat_manage')" class="w-full mt-4 text-slate-400 fs-14 underline hover:text-red-500 transition-all font-medium text-center">
                                CANCEL &amp; RETURN
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>`;
}
function editCat(id) { showCat(id); }

async function saveCat(editId = '') {
    const n = document.getElementById('cn').value.trim();
    const d = document.getElementById('cd').value.trim();
    const cCode = document.getElementById('cc')?.value || '';
    const tGrade = document.getElementById('cgr')?.value || '';
    const tLimit = document.getElementById('ctm')?.value || 0;
    let u = '';

    if (!n) return showToast("?œí—˜ì§€ ?´ë¦„???…ë ¥??ì£¼ì„¸??");
    if (!d) return showToast("?ì„±?„ì›” 4?ë¦¬ë¥??…ë ¥?˜ì„¸?? (?? 2602)");
    if (!/^\d{4}$/.test(d)) return showToast("?ì„±?„ì›”?€ 4?ë¦¬ ?«ìë¡??…ë ¥??ì£¼ì„¸?? (?? 2602)");

    if (editId) {
        if (!confirm('?’¾ ?˜ì •???œí—˜ì§€ ?•ë³´ë¥??€?¥í•˜?œê² ?µë‹ˆê¹?')) return;
        const cat = globalConfig.categories.find(c => c.id === editId);
        if (cat) {
            const oldName = cat.name;
            const newName = n;

            if (oldName !== newName) {
                const folderId = extractFolderId(cat.targetFolderUrl);
                if (folderId && globalConfig.masterUrl) {
                    try {
                        toggleLoading(true);
                        showToast(`?›°ï¸??´ë”ëª?ë³€ê²?ì¤? [${newName}]...`);
                        const masterUrl = globalConfig.masterUrl || DEFAULT_MASTER_URL;
                        const finalFolderName = `${cat.classification || 'A'}_${cat.createdDate}_${newName}`;
                        const res = await fetch(masterUrl, {
                            method: 'POST',
                            body: JSON.stringify({ type: 'RENAME_FOLDER', folderId: folderId, newName: finalFolderName })
                        });
                        const resultText = await res.text();
                        let result = { status: "Error" };
                        try { result = JSON.parse(resultText); } catch (pe) { if (resultText.includes("Success")) result = { status: "Success" }; }

                        if (result.status === "Success") {
                            showToast("???œë¼?´ë¸Œ ?´ë”ëª?ë³€ê²??„ë£Œ");
                        } else {
                            showToast(`? ï¸ ?´ë”ëª?ë³€ê²??¤íŒ¨: ${result.message || '?????†ëŠ” ?¤ë¥˜'}`);
                        }
                    } catch (err) {
                        console.error("Folder rename failed:", err);
                        showToast("? ï¸ ?´ë”ëª?ë³€ê²??¤íŒ¨ (?¤ì •ë§??˜ì •??");
                    } finally {
                        toggleLoading(false);
                    }
                }
            }

            cat.name = n;
            cat.targetGrade = tGrade;
            cat.timeLimit = tLimit;
            save();
            await saveConfigToCloud();
            showToast(`[${n}] ?œí—˜ì§€ ?•ë³´ê°€ ?…ë°?´íŠ¸?˜ì—ˆ?µë‹ˆ??`);
            changeTab('cat_manage');
            return;
        }
    } else {
        if (!globalConfig.mainServerLink) return showToast("???´ë” ?ì„±???„í•´??[Main Server Folder] ?¤ì •???„ìš”?©ë‹ˆ??");

        const finalFolderName = `${cCode}_${d}_${n}`;
        if (!confirm(`?’¾ [${finalFolderName}] ? ê·œ ?œí—˜ì§€ë¥??ì„± ë°??€?¥í•˜?œê² ?µë‹ˆê¹?\n(?œë¼?´ë¸Œ???´ë”ê°€ ?ë™ ?ì„±?©ë‹ˆ??`)) return;

        showToast("??êµ¬ê? ?œë¼?´ë¸Œ ?´ë” ?ì„± ì¤?..");
        try {
            const rootId = extractFolderId(globalConfig.mainServerLink);
            if (!rootId) return showToast("??ë©”ì¸ ?œë²„ ?´ë” ì£¼ì†Œê°€ ?¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤.");

            const masterUrl = globalConfig.masterUrl || DEFAULT_MASTER_URL;
            const res = await fetch(masterUrl, {
                method: 'POST',
                body: JSON.stringify({ type: "CREATE_FOLDER", parentFolderId: rootId, folderName: finalFolderName })
            });

            const resultText = await res.text();
            let json = { status: "Error" };
            try { json = JSON.parse(resultText); } catch (pe) { if (resultText.includes("Success")) { json = { status: "Success", folderUrl: resultText.match(/https?:\/\/[^\s]+/)?.[0] }; } }

            if (json.status === "Success" && json.folderUrl) {
                u = json.folderUrl;
                showToast("???´ë” ?ì„± ?„ë£Œ ë°??ìš©??");
            } else {
                throw new Error(json.message || "?œë²„?ì„œ ?¤ë¥˜ë¥?ë°˜í™˜?ˆìŠµ?ˆë‹¤.");
            }
        } catch (e) {
            console.error(e);
            toggleLoading(false);
            return showToast("???´ë” ?ë™ ?ì„± ?¤íŒ¨: " + e.message);
        }
    }

    globalConfig.categories.push({
        id: 'cat_' + Date.now(),
        name: n,
        createdDate: d,
        targetFolderUrl: u,
        classification: cCode,
        targetGrade: tGrade,
        timeLimit: tLimit
    });
    save();
    await saveConfigToCloud();
    showToast(`??[${n}] ?ŒìŠ¤??ë¶„ë¥˜ê°€ ?±ê³µ?ìœ¼ë¡??€?¥ë˜?ˆìŠµ?ˆë‹¤.`);
    changeTab('cat_manage');
}
async function delCat(id) {
    const cat = globalConfig.categories.find(c => c.id === id);
    if (!cat) return;

    if (!confirm(`? ï¸ ?•ë§ë¡?[${cat.name}] ì¹´í…Œê³ ë¦¬ë¥??? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?\n\n?? œ ???´ë‹¹ ?´ë”??"ë°±ì—…" ?´ë”ë¡??´ë™?©ë‹ˆ??`)) return;

    toggleLoading(true);
    let proceedWithDelete = false;

    const folderId = extractFolderId(cat.targetFolderUrl);
    if (folderId) {
        try {
            const masterUrl = globalConfig.masterUrl || DEFAULT_MASTER_URL;
            const res = await fetch(masterUrl, {
                method: 'POST',
                body: JSON.stringify({
                    type: 'BACKUP_FOLDER',
                    folderId: folderId,
                    categoryName: cat.name
                })
            });
            const resultText = await res.text();
            let json = { status: "Error" };
            try { json = JSON.parse(resultText); } catch (pe) {
                if (resultText.includes("Success")) json = { status: "Success" };
            }

            if (json.status === "Success") {
                showToast(`?“ [${cat.name}] ?´ë”ê°€ ë°±ì—… ?´ë”ë¡??´ë™?˜ì—ˆ?µë‹ˆ??`);
                proceedWithDelete = true;
            } else {
                if (confirm(`? ï¸ ?´ë” ë°±ì—… ?‘ì—…???¤íŒ¨?ˆìŠµ?ˆë‹¤.\n(?¬ìœ : ${json.message || 'ID ì°¾ì„ ???†ìŒ'})\n\n?´ë” ë°±ì—… ?†ì´ ?¤ì •???? œ? ê¹Œ??`)) {
                    proceedWithDelete = true;
                }
            }
        } catch (err) {
            console.error(err);
            if (confirm(`? ï¸ ë°±ì—… ?œë²„?€ ?µì‹  ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.\n\n?´ë” ë°±ì—… ?†ì´ ?¤ì •???? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?`)) {
                proceedWithDelete = true;
            }
        }
    } else {
        if (confirm(`? ï¸ ë°±ì—…??? íš¨???´ë” ì£¼ì†Œê°€ ?¤ì •?˜ì–´ ?ˆì? ?ŠìŠµ?ˆë‹¤.\n\n?´ë‹¹ ì¹´í…Œê³ ë¦¬ ?¤ì •ë§??? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?`)) {
            proceedWithDelete = true;
        }
    }

    if (proceedWithDelete) {
        try {
            globalConfig.categories = globalConfig.categories.filter(c => c.id !== id);
            if (curCatId === id) curCatId = globalConfig.categories[0]?.id || "";
            save();
            await saveConfigToCloud();
            showToast(`??[${cat.name}] ì¹´í…Œê³ ë¦¬ ?•ë³´ê°€ ?? œ?˜ì—ˆ?µë‹ˆ??`);
            changeTab('cat_manage');
        } catch (saveErr) {
            console.error(saveErr);
            showToast('? ï¸ ?¤ì • ?? œ ì¤??¤ë¥˜ ë°œìƒ');
        }
    }
    toggleLoading(false);
}
async function resetCategoryDB(id, type) {
    const cat = globalConfig.categories.find(c => c.id === id);
    if (!cat) return;

    const dbName = type === 'student' ? '?™ìƒ DB' : 'ë¬¸í•­ DB';
    if (!confirm(`? ï¸ ?•ë§ë¡?[${cat.name}]??[${dbName}]ë¥?ì´ˆê¸°?”í•˜?œê² ?µë‹ˆê¹?\n\n???‘ì—…?€ ?˜ëŒë¦????†ìœ¼ë©? ?œíŠ¸??ëª¨ë“  ?°ì´?°ê? ?êµ¬ ?? œ?©ë‹ˆ??\n(?´ë” ?Œì¼?€ ? ì??©ë‹ˆ??`)) return;

    toggleLoading(true);
    try {
        // Apps Script??ë¦¬ì…‹ ?”ì²­
        const folderId = extractFolderId(cat.targetFolderUrl);
        if (folderId) {
            const masterUrl = globalConfig.masterUrl || DEFAULT_MASTER_URL;
            const res = await fetch(masterUrl, {
                method: 'POST',
                body: JSON.stringify({
                    type: 'RESET_DB',
                    dbType: type, // 'student' or 'question'
                    parentFolderId: folderId, // [Fix] folderId -> parentFolderId (Backend requirement)
                    categoryName: cat.name
                })
            });
            const resultText = await res.text();
            console.log("Reset DB Response:", resultText);

            let json = { status: "Error", message: resultText };
            try {
                // Try parsing JSON
                json = JSON.parse(resultText);
            } catch (e) {
                // Handle plain text errors (GAS convention)
                if (resultText.includes("Error")) {
                    json = { status: "Error", message: resultText };
                } else if (resultText.includes("Success")) {
                    json = { status: "Success" };
                }
            }

            if (json.status === "Success") {
                showToast(`?»ï¸ [${dbName}] ?œíŠ¸ê°€ ì´ˆê¸°?”ë˜?ˆìŠµ?ˆë‹¤.`);
                // ë¬¸í•­ DB ë¦¬ì…‹ ??ë¡œì»¬ ?°ì´?°ë„ ?„í„°ë§?
                if (type === 'question') {
                    showToast('? ï¸ ë¡œì»¬ ?°ì´???™ê¸°?”ë? ?„í•´ ?˜ì´ì§€ë¥??ˆë¡œê³ ì¹¨?´ì£¼?¸ìš”.');
                    // [Optional] Local clean up if needed immediately
                    // globalConfig.questions = globalConfig.questions.filter(q => q.catId !== id);
                    // save();
                }
            } else {
                throw new Error(json.message || "Unknown Server Error");
            }
        }
    } catch (err) {
        console.error(err);
        showToast('? ï¸ DB ì´ˆê¸°???”ì²­ ?¤íŒ¨ (Apps Script ?…ë°?´íŠ¸ ?„ìš”)');
    } finally {
        toggleLoading(false);
    }
}

async function generateUniqueStudentId(dateStr, gradeStr) {
    // 1. ? ì§œ ?¬ë§· (YYMMDD)
    const d = new Date(dateStr);
    const yy = d.getFullYear().toString().slice(2);
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const dateCode = `${yy}${mm}${dd}`;

    // 2. ?™ë…„ ì½”ë“œ ë³€??
    // ì´?~ì´?: E4~E6, ì¤?~ì¤?: M1~M3, ê³?~ê³?: H1~H3
    let gradeCode = "E";
    if (gradeStr.includes('ì´?)) gradeCode = "E" + gradeStr.replace('ì´?, '');
    else if (gradeStr.includes('ì¤?)) gradeCode = "M" + gradeStr.replace('ì¤?, '');
    else if (gradeStr.includes('ê³?)) gradeCode = "H" + gradeStr.replace('ê³?, '');

    const groupKey = dateCode + gradeCode; // ?? 260129M2

    // 3. ë¬´ì‘??4?ë¦¬ ?±ë¡ë²ˆí˜¸ ?ì„± (0000 ~ 9999)
    // ê¸°ì¡´ idCounters ?€???œê³„???œë¤?±ì„ ì¡°í•©??ì¶©ëŒ ë°©ì?
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const studentId = `${groupKey}${randomSuffix}`;

    return studentId;
}

// --- ê´€ë¦¬ì ì½”ë“œ ë³€ê²?---
function renderAdminCode(c) {
    c.innerHTML = `
                <div class="animate-fade-in-safe space-y-4 pb-20 text-left">
                    <h2 class="fs-32 text-[#013976] underline decoration-slate-200 decoration-8 underline-offset-8 font-black mb-12  uppercase tracking-tighter">Admin Code Setting</h2>
                    <div class="card !bg-[#013976] !p-12 text-white border-none">
                        <h3 class="fs-32 text-white font-black uppercase tracking-tighter underline decoration-blue-400/30 decoration-8 underline-offset-8 mb-6 leading-none">Change Management Code</h3>
                        <p class="fs-18 text-blue-200 mb-8">ê´€ë¦¬ì ëª¨ë“œ(Admin) ?‘ì†???¬ìš©???ˆë¡œ???¡ì„¸??ì½”ë“œë¥??¤ì •?˜ì„¸??</p>
                        <input type="text" id="new-admin-code" autocomplete="off" class="ys-field !bg-white/10 !text-white border-white/20" value="${globalConfig.adminCode}" placeholder="??ì½”ë“œ ?…ë ¥">
                        <button onclick="(async()=>{const val=document.getElementById('new-admin-code').value; if(!val) return showToast('ì½”ë“œë¥??…ë ¥?˜ì„¸??); globalConfig.adminCode=val; save(); await saveConfigToCloud(); showToast('ê´€ë¦¬ì ì½”ë“œê°€ ?±ê³µ?ìœ¼ë¡?ë³€ê²?ë°??™ê¸°?”ë˜?ˆìŠµ?ˆë‹¤.'); changeTab('main_config');})()" 
                        class="bg-white text-[#013976] w-full py-6 rounded-2xl fs-18 mt-4 hover:bg-slate-100 transition-all uppercase">?’¾ Update & Sync Code</button>
                    </div>
                </div>`;
}

window.onload = () => {
    // Initialize adminCode if not present (e.g., first run)
    if (globalConfig.adminCode === undefined) {
        globalConfig.adminCode = "1111";
        save();
    }
    applyBranding();

    // [Fix] ??ì§„ì… ??ë¬´ì¡°ê±?ë°±ê·¸?¼ìš´?œì—??ìµœì‹  ?°ì´?°ë? ?™ê¸°?”í•˜?„ë¡ ê°•ì œ
    if (globalConfig.masterUrl) {
        console.log("?”„ Initializing background cloud sync for latest configuration...");
        loadConfigFromCloud(true).then((success) => {
            if (success) {
                console.log("??Auto-sync success!");
                applyBranding();

                // ?™ìƒ ?”ë©´ ??? íƒ ëª©ë¡ UI ê°±ì‹  (?´ë? ì§„ì…??ê²½ìš° ?€ë¹?
                const c = document.getElementById('dynamic-content');
                if (c && c.getAttribute('data-canvas-id') === '02') {
                    renderStudentLogin(); // Reload student form if active
                }
            } else {
                console.log("? ï¸ Auto-sync failed or no newer config found.");
            }
        });
    }
};

// ===== ?™ìƒ ?±ì  ê´€ë¦??œìŠ¤??=====

// ?™ìƒ ?±ì  ?…ë ¥ UI ?Œë”ë§?
function renderScoreInput(c) {
    if (!globalConfig.categories || globalConfig.categories.length === 0) {
        renderEmptyState(c, 'Student Score Input');
        return;
    }

    setCanvasId('06');
    c.innerHTML = `
        <div class="animate-fade-in-safe space-y-6 pb-10">
            <h2 class="fs-32 text-[#013976] leading-none font-black uppercase !border-none !pb-0">Student Score Input</h2>

            <!-- 1. Category Selection -->
            <div class="card !py-3.5 !px-6 flex items-center justify-between shadow-lg relative overflow-hidden" style="background: linear-gradient(135deg, #ffffff 0%, #eef4ff 100%); border: 2px solid rgba(1,57,118,0.15);">
                <div style="position:absolute; top:0; left:0; right:0; height:3px; background: linear-gradient(90deg, #60a5fa, #6366f1, #a855f7);"></div>
                <div class="flex items-center gap-4 w-full">
                    <label class="ys-label !mb-0 whitespace-nowrap !text-[#013976] font-bold">&#x1F4C2; &#xC2DC;&#xD5D8;&#xC9C0; &#xC120;&#xD0DD;</label>
                    <select id="input-category" class="ys-field flex-grow !font-normal !text-[#013976] !bg-white !text-[16px]"
                            onchange="handleScoreCategoryChange(this.value)">
                        <option value="" disabled selected hidden>&#xC2DC;&#xD5D8;&#xC9C0;&#xB97C; &#xC120;&#xD0DD;&#xD558;&#xC138;&#xC694;</option>
                        ${globalConfig.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                    </select>
                </div>
            </div>

            <!-- 2. Form Area (hidden until category selected) -->
            <div id="score-form-area" class="hidden space-y-6">

                <!-- Student Info -->
                <div class="card space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label class="ys-label font-bold">&#x1F4DD; &#xD559;&#xC0DD;&#xBA85;</label>
                            <input type="text" id="input-student-name" class="ys-field" placeholder="&#xC774;&#xB984; &#xC785;&#xB825;" autocomplete="off">
                        </div>
                        <div>
                            <label class="ys-label font-bold">&#x1F393; &#xD559;&#xB144;</label>
                            <select id="input-grade" class="ys-field" onchange="updateClassDropdown06(this.value)">
                                <option value="" disabled selected hidden>&#xD559;&#xB144; &#xC120;&#xD0DD;</option>
                                <option value="&#xCD08;1">&#xCD08;1</option>
                                <option value="&#xCD08;2">&#xCD08;2</option>
                                <option value="&#xCD08;3">&#xCD08;3</option>
                                <option value="&#xCD08;4">&#xCD08;4</option>
                                <option value="&#xCD08;5">&#xCD08;5</option>
                                <option value="&#xCD08;6">&#xCD08;6</option>
                                <option value="&#xC911;1">&#xC911;1</option>
                                <option value="&#xC911;2">&#xC911;2</option>
                                <option value="&#xC911;3">&#xC911;3</option>
                                <option value="&#xACE0;1">&#xACE0;1</option>
                                <option value="&#xACE0;2">&#xACE0;2</option>
                                <option value="&#xACE0;3">&#xACE0;3</option>
                            </select>
                        </div>
                        <div>
                            <label class="ys-label font-bold">&#x1F4C5; &#xC751;&#xC2DC;&#xC77C;</label>
                            <input type="text" id="input-test-date" class="ys-field" placeholder="YYYY-MM-DD" autocomplete="off">
                        </div>
                        <div>
                            <label class="ys-label">&#x1F464; &#xD559;&#xC0DD;ID (&#xC790;&#xB3D9;&#xC0DD;&#xC131;)</label>
                            <input type="text" id="input-student-id" class="ys-field bg-slate-100 text-slate-500 font-mono" placeholder="&#xC800;&#xC7A5; &#xC2DC; &#xC790;&#xB3D9;&#xC644;&#xC131;" readonly>
                        </div>
                        <div>
                            <label class="ys-label font-bold" style="color:#7c3aed">&#x1F3EB; &#xB4F1;&#xB85D;&#xD559;&#xAE09;(&#xC608;&#xC815;)</label>
                            <select id="input-student-class" class="ys-field" style="border-color:#7c3aed;color:#7c3aed;font-weight:700">
                                <option value="">?™ê¸‰ ? íƒ (?™ë…„ ë¨¼ì? ? íƒ)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Question Score Input -->
                <div class="card space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <h3 class="fs-18 text-[#013976] font-black uppercase">&#x1F4CB; &#xBB38;&#xD56D;&#xBCC4; &#xC810;&#xC218; &#xC785;&#xB825;</h3>
                            <div class="w-px h-5 bg-slate-300 mx-1"></div>
                            <label class="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" id="chk-no-qscore" class="w-4 h-4 accent-[#013976]" onchange="toggleQScoreMode(this.checked)">
                                <span class="text-sm font-bold text-slate-400">&#xBB38;&#xD56D;&#xBCC4; &#xC810;&#xC218; &#xC815;&#xBCF4; &#xC5C6;&#xC74C;</span>
                            </label>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-sm font-bold text-slate-500">&#xCD1D;&#xC810;</span>
                            <div class="bg-[#013976] text-white rounded-2xl px-6 py-2 flex items-center gap-2">
                                <span id="score-total-display" class="text-2xl font-black">0</span>
                                <span class="text-blue-300 font-bold">/</span>
                                <span id="score-max-display" class="text-lg font-bold text-blue-200">0</span>
                            </div>
                        </div>
                    </div>
                    <div id="question-score-list" class="space-y-2"></div>
                </div>

                <!-- ?„ì½”?”ì–¸ + ë²„íŠ¼ (ê°™ì? row) -->
                <div class="flex items-start gap-4">

                    <!-- ?„ì½”?”ì–¸ (ì¡°ê±´ë¶€ ë³´ì„) -->
                    <div id="accordion-wrapper" class="hidden flex-1">
                        <div class="card !p-0 overflow-hidden">
                            <button onclick="toggleAccordion('accordion-section')" class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-all">
                                <span class="fs-17 font-bold text-[#013976]">&#x1F4DA; &#xC601;&#xC5ED;&#xBCC4; &#xC810;&#xC218; &#xC785;&#xB825;</span>
                                <span id="accordion-section-icon" class="text-slate-400 text-xl">&#x25B6;</span>
                            </button>
                            <div id="accordion-section" class="hidden px-6 pb-6 border-t border-slate-100">
                                <p class="text-sm text-slate-400 mt-3 mb-4">&#xBB38;&#xD56D;&#xBCC4; &#xC785;&#xB825;&#xC774; &#xC5C6;&#xC744; &#xACBD;&#xC6B0;&#xC5D0;&#xB9CC; &#xCD1D;&#xC810; &#xACC4;&#xC0B0;&#xC5D0; &#xBC18;&#xC601;&#xB429;&#xB2C8;&#xB2E4;.</p>
                                <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div><label class="text-sm font-bold text-slate-500 font-bold mb-0 block">Grammar</label><span id="max-grammar" class="font-normal text-slate-400 text-sm block mb-1"></span>
                                        <input type="number" id="input-grammar" data-max-id="max-grammar" class="ys-field text-center font-bold" placeholder="0" min="0" max="9999" oninput="clampAccordionScore(this); calculateTotalScore()"></div>
                                    <div><label class="text-sm font-bold text-slate-500 font-bold mb-0 block">Writing</label><span id="max-writing" class="font-normal text-slate-400 text-sm block mb-1"></span>
                                        <input type="number" id="input-writing" data-max-id="max-writing" class="ys-field text-center font-bold" placeholder="0" min="0" max="9999" oninput="clampAccordionScore(this); calculateTotalScore()"></div>
                                    <div><label class="text-sm font-bold text-slate-500 font-bold mb-0 block">Reading</label><span id="max-reading" class="font-normal text-slate-400 text-sm block mb-1"></span>
                                        <input type="number" id="input-reading" data-max-id="max-reading" class="ys-field text-center font-bold" placeholder="0" min="0" max="9999" oninput="clampAccordionScore(this); calculateTotalScore()"></div>
                                    <div><label class="text-sm font-bold text-slate-500 font-bold mb-0 block">Listening</label><span id="max-listening" class="font-normal text-slate-400 text-sm block mb-1"></span>
                                        <input type="number" id="input-listening" data-max-id="max-listening" class="ys-field text-center font-bold" placeholder="0" min="0" max="9999" oninput="clampAccordionScore(this); calculateTotalScore()"></div>
                                    <div><label class="text-sm font-bold text-slate-500 font-bold mb-0 block">Vocabulary</label><span id="max-vocab" class="font-normal text-slate-400 text-sm block mb-1"></span>
                                        <input type="number" id="input-vocab" data-max-id="max-vocab" class="ys-field text-center font-bold" placeholder="0" min="0" max="9999" oninput="clampAccordionScore(this); calculateTotalScore()"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ë²„íŠ¼??(??ƒ ?°ì¸¡, ?„ì½”?”ì–¸ ? ë¬´?€ ë¬´ê?) -->
                    <div class="flex gap-4 items-center ml-auto flex-none">
                        <button onclick="clearScoreInputs()" class="px-8 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 transition-all">
                            &#x1F504; &#xCD08;&#xAE30;&#xD654; (Reset)
                        </button>
                        <button onclick="saveStudentScore()" class="btn-ys !px-12 !py-4 hover:scale-[1.02] active:scale-95 transition-all text-lg">
                            &#x1F4BE; &#xC131;&#xC801; &#xC800;&#xC7A5; (Save Record)
                        </button>
                    </div>

                </div><!-- /accordion+ë²„íŠ¼ row -->

            </div><!-- /score-form-area -->

        </div>
    `;
}

async function handleScoreCategoryChange(catId) {
    const formArea = document.getElementById('score-form-area');
    if (formArea) formArea.classList.remove('hidden');

    const category = globalConfig.categories.find(cat => cat.id === catId);
    if (!category) return;

    const folderId = extractFolderId(category.targetFolderUrl);
    if (!folderId) { showToast('? ï¸ ?´ë” ID ?¤ë¥˜: ì¹´í…Œê³ ë¦¬ ?¤ì •???•ì¸?˜ì„¸??'); return; }

    const listEl = document.getElementById('question-score-list');
    if (!listEl) return;
    listEl.innerHTML = '<p class="text-slate-400 text-sm text-center py-10">??ë¬¸í•­ ?•ë³´ ë¶ˆëŸ¬?¤ëŠ” ì¤?..</p>';

    toggleLoading(true);
    let catQuestions = [];
    try {
        const result = await sendReliableRequest({ type: 'GET_FULL_DB', parentFolderId: folderId, categoryName: category.name });
        let newQuestions = (result.status === 'Success') ? (result.questions || []) : [];
        if (newQuestions.length === 0 && globalConfig.questions) {
            newQuestions = globalConfig.questions.filter(q => String(q.catId) === String(catId));
        }
        if (newQuestions.length > 0) {
            newQuestions = newQuestions.map(q => ({ ...q, catId: catId }));
            const others = (globalConfig.questions || []).filter(q => String(q.catId) !== String(catId));
            globalConfig.questions = [...others, ...newQuestions];
        }
        catQuestions = newQuestions.sort((a, b) => (parseInt(a.no) || 0) - (parseInt(b.no) || 0));
    } catch(e) {
        console.error(e);
        showToast('? ï¸ ë¬¸í•­ ë¶ˆëŸ¬?¤ê¸° ?¤íŒ¨: ' + e.message);
        catQuestions = (globalConfig.questions || [])
            .filter(q => String(q.catId) === String(catId))
            .sort((a, b) => (parseInt(a.no) || 0) - (parseInt(b.no) || 0));
    } finally {
        toggleLoading(false);
    }

    const maxScore = catQuestions.reduce((sum, q) => sum + (parseInt(q.score) || 0), 0);
    const totalDisp = document.getElementById('score-total-display');
    const maxDisp = document.getElementById('score-max-display');
    if (totalDisp) totalDisp.textContent = '0';
    if (maxDisp) maxDisp.textContent = maxScore;

    // ?ì—­ë³??œì´?„ë³„ ë§Œì  span ?…ë°?´íŠ¸
    const setMax = (spanId, val) => {
        const el = document.getElementById(spanId);
        if (!el) return;
        if (val > 0) { el.textContent = 'ë§Œì  ' + val + '??; el.style.color = ''; }
        else { el.textContent = '?†ìŒ'; el.style.color = '#94a3b8'; }
        // ?°ê²°??input??max ?ì„±??ê°±ì‹ 
        const inp = document.querySelector(`[data-max-id="${spanId}"]`);
        if (inp) inp.max = val > 0 ? val : 9999;
    };
    const cqs = catQuestions;
    const sm = (sec) => cqs.filter(q => q.section === sec).reduce((s,q) => s+(parseInt(q.score)||0), 0);
    const dm = (dif) => cqs.filter(q => q.difficulty === dif).reduce((s,q) => s+(parseInt(q.score)||0), 0);
    setMax('max-grammar',       sm('Grammar'));
    setMax('max-writing',       sm('Writing'));
    setMax('max-reading',       sm('Reading'));
    setMax('max-listening',     sm('Listening'));
    setMax('max-vocab',         sm('Vocabulary'));

    if (catQuestions.length === 0) {
        listEl.innerHTML = '<p class="text-slate-400 text-sm text-center py-6">?±ë¡??ë¬¸í•­???†ìŠµ?ˆë‹¤. ë¬¸í•­ ë¦¬ìŠ¤?¸ì—??ë¨¼ì? ë¬¸í•­???±ë¡??ì£¼ì„¸??</p>';
        return;
    }

    // 10ê°œì”© ì²?¬ë¡??˜ëˆ  ?„ì¹˜ ?Œì´ë¸??Œë”ë§?
    const CHUNK_SIZE = 10;
    const chunks = [];
    for (let i = 0; i < catQuestions.length; i += CHUNK_SIZE) {
        chunks.push(catQuestions.slice(i, i + CHUNK_SIZE));
    }

    listEl.innerHTML = chunks.map((chunk, chunkIdx) => {
        const startNo = chunkIdx * CHUNK_SIZE + 1;
        // ??ƒ 10??ê³ ì •: ë¶€ì¡±í•œ ì¹¸ì? ë¹??€ë¡?ì±„ì?
        const padLen = CHUNK_SIZE - chunk.length;
        const emptyTh = '<th class="text-center font-black text-white text-[15px] px-2 py-1.5" style="width:9%;"></th>';
        const emptyTd = '<td class="px-2 py-1.5"></td>';
        const headerCells = chunk.map(q => `<th class="text-center font-black text-white text-[15px] px-2 py-1.5" style="width:9%;">${q.no || '-'}</th>`).join('') + emptyTh.repeat(padLen);
        const typeCells = chunk.map(q => `<td class="text-center text-sm text-slate-500 px-2 py-1.5 truncate" title="${q.type || ''}">${q.type || '-'}</td>`).join('') + emptyTd.repeat(padLen);
        const subTypeCells = chunk.map(q => `<td class="text-center text-sm text-slate-500 px-2 py-1.5 truncate" title="${q.subType || ''}">${q.subType || '-'}</td>`).join('') + emptyTd.repeat(padLen);
        const difficultyCells = chunk.map(q => `<td class="text-center text-sm text-slate-500 px-2 py-1.5 truncate" title="${q.difficulty || ''}">${q.difficulty || '-'}</td>`).join('') + emptyTd.repeat(padLen);
        const maxCells = chunk.map(q => `<td class="text-center text-sm font-bold text-slate-600 px-2 py-1.5">${parseInt(q.score)||0}<span class="text-sm font-normal text-slate-400">??/span></td>`).join('') + emptyTd.repeat(padLen);
        const inputCells = chunk.map(q => {
            const maxQ = parseInt(q.score) || 0;
            return `<td class="px-1 py-1.5"><input type="number" id="q-score-${q.id}" data-qid="${q.id}" data-max="${maxQ}" class="w-full ys-field !py-0.5 text-center font-bold !text-[#013976] !text-[15px]" placeholder="0" min="0" max="${maxQ}" value="" oninput="clampQScore(this); calculateTotalScore();"></td>`;
        }).join('') + emptyTd.repeat(padLen);
        return `
        <div class="overflow-x-auto rounded-xl border border-slate-200 mb-2">
            <table class="w-full border-collapse text-sm">
                <thead>
                    <tr class="bg-[#013976]">
                        <th class="text-center text-sm text-blue-200 font-bold px-3 py-1.5 whitespace-nowrap">ë²ˆí˜¸</th>
                        ${headerCells}
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-slate-100 bg-slate-50">
                        <td class="text-center text-sm font-bold text-slate-400 px-3 py-1.5 whitespace-nowrap">?ì—­</td>
                        ${typeCells}
                    </tr>
                    <tr class="border-b border-slate-100">
                        <td class="text-center text-sm font-bold text-slate-400 px-3 py-1.5 whitespace-nowrap">?¸ë??ì—­</td>
                        ${subTypeCells}
                    </tr>
                    <tr class="border-b border-slate-100 bg-slate-50">
                        <td class="text-center text-sm font-bold text-slate-400 px-3 py-1.5 whitespace-nowrap">?œì´??/td>
                        ${difficultyCells}
                    </tr>
                    <tr class="border-b border-slate-100">
                        <td class="text-center text-sm font-bold text-slate-400 px-3 py-1.5 whitespace-nowrap">ë§Œì </td>
                        ${maxCells}
                    </tr>
                    <tr class="bg-blue-50/40">
                        <td class="text-center text-sm font-bold text-[#013976] px-3 py-1.5 whitespace-nowrap">?ìˆ˜?…ë ¥</td>
                        ${inputCells}
                    </tr>
                </tbody>
            </table>
        </div>`;
    }).join('');


    showToast('\u2705 ' + catQuestions.length + '\uAC1C \uBB38\uD56D \uB85C\uB4DC \uC644\uB8CC (\uB9CC\uC810 ' + maxScore + '\uC810)');
    // Flatpickr ?¬ë ¥ ?ìš©
    setTimeout(() => applyYsDatePicker('#input-test-date'), 50);
}

// ê³µìœ  Flatpickr ?¬ë ¥ ?¬í¼ (?˜ë™ ?…ë ¥ ?ˆìš©)
function applyYsDatePicker(selector, extraOpts = {}) {
    if (typeof flatpickr === 'undefined') return;
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    const updateYear = (inst) => {
        const yi = inst.yearElements[0];
        if (!yi || yi.tagName === 'SELECT') { if (yi) yi.value = inst.currentYear; return; }
        const sel = document.createElement('select');
        sel.className = 'flatpickr-monthDropdown-months !w-auto !m-0';
        const cur = new Date().getFullYear();
        for (let y = cur - 10; y <= cur + 5; y++) {
            const o = document.createElement('option');
            o.value = y; o.text = y;
            if (y === inst.currentYear) o.selected = true;
            sel.appendChild(o);
        }
        sel.addEventListener('change', e => inst.changeYear(+e.target.value));
        yi.parentNode.replaceChild(sel, yi);
    };
    flatpickr(el, Object.assign({
        locale: 'ko',
        dateFormat: 'Y-m-d',
        allowInput: true,
        disableMobile: true,
        altInput: true,
        altFormat: 'Y-m-d (D)',
        defaultDate: new Date(),
        monthSelectorType: 'dropdown',
        onReady:      (_, __, i) => updateYear(i),
        onMonthChange:(_, __, i) => setTimeout(() => updateYear(i), 0),
        onYearChange: (_, __, i) => setTimeout(() => updateYear(i), 10),
        onOpen:       (_, __, i) => setTimeout(() => updateYear(i), 0),
    }, extraOpts));
}

// Canvas 06: ?™ë…„ ? íƒ ???´ë‹¹ ?™ë…„ ?™ê¸‰ë§?dropdown???œì‹œ
function updateClassDropdown06(grade) {
    const sel = document.getElementById('input-student-class');
    if (!sel) return;
    const list = getClassesForGrade(grade);
    sel.innerHTML = `<option value="">${list.length ? '?™ê¸‰ ? íƒ' : '?±ë¡???™ê¸‰ ?†ìŒ'}</option>`
        + list.map(n => `<option value="${n}">${n}</option>`).join('');
}

function clampQScore(input) {
    const max = parseInt(input.dataset.max) || 0;
    let val = parseInt(input.value);
    if (isNaN(val) || val < 0) { input.value = ''; return; }
    if (val > max) { input.value = max; }
}

function clampAccordionScore(input) {
    const maxId = input.dataset.maxId;
    const maxEl = maxId ? document.getElementById(maxId) : null;
    const maxVal = maxEl ? parseInt(maxEl.textContent) : NaN;
    let val = parseInt(input.value);
    if (isNaN(val) || val < 0) { input.value = ''; return; }
    if (!isNaN(maxVal) && maxVal > 0 && val > maxVal) { input.value = maxVal; }
}

function toggleAccordion(id) {
    const panel = document.getElementById(id);
    const icon = document.getElementById(id + '-icon');
    if (!panel) return;
    const isHidden = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !isHidden);
    if (icon) icon.textContent = isHidden ? '\u25BC' : '\u25B6';
}

function toggleQScoreMode(checked) {
    const wrapper = document.getElementById('accordion-wrapper');
    const qList   = document.getElementById('question-score-list');
    if (wrapper) wrapper.classList.toggle('hidden', !checked);
    if (qList)   qList.classList.toggle('hidden', checked);
}

function calculateTotalScore() {
    const qInputs = document.querySelectorAll('[id^="q-score-"]');
    let qSum = 0, qHasInput = false;
    qInputs.forEach(inp => {
        const v = parseInt(inp.value);
        if (!isNaN(v) && v > 0) { qSum += v; qHasInput = true; }
    });

    if (qHasInput) {
        const d = document.getElementById('score-total-display');
        if (d) d.textContent = qSum;
        return;
    }

    const grammar   = parseInt(document.getElementById('input-grammar')?.value) || 0;
    const writing   = parseInt(document.getElementById('input-writing')?.value) || 0;
    const reading   = parseInt(document.getElementById('input-reading')?.value) || 0;
    const listening = parseInt(document.getElementById('input-listening')?.value) || 0;
    const vocab     = parseInt(document.getElementById('input-vocab')?.value) || 0;
    const sumSec    = grammar + writing + reading + listening + vocab;

    const finalTotal = sumSec;

    const d = document.getElementById('score-total-display');
    if (d) d.textContent = finalTotal;
}

function clearScoreInputs(resetCat = true, showMsg = true) {
    ['input-student-id','input-student-name',
     'input-grammar','input-writing','input-reading','input-listening','input-vocab',

    ].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.querySelectorAll('[id^="q-score-"]').forEach(inp => inp.value = '');
    const d = document.getElementById('score-total-display');
    if (d) d.textContent = '0';
    if (showMsg) showToast('\u2728 \uC785\uB825 \uB0B4\uC6A9\uC774 \uCD08\uAE30\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4');
}

async function saveStudentScore() {
    if (!confirm('\uD83D\uDCBE \uC785\uB825\uD55C \uC131\uC801 \uC815\uBCF4\uB97C \uC800\uC7A5\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?')) return;

    const categoryId = document.getElementById('input-category').value;
    if (!categoryId) { showToast('\u26A0\uFE0F \uCE74\uD14C\uACE0\uB9AC\uB97C \uC120\uD0DD\uD558\uC138\uC694'); return; }
    const category = globalConfig.categories.find(c => c.id === categoryId);

    const studentName  = document.getElementById('input-student-name').value.trim();
    const grade        = document.getElementById('input-grade').value;
    const studentClass = document.getElementById('input-student-class')?.value.trim() || '';
    const testDate     = document.getElementById('input-test-date').value;

    if (!studentName) { showToast('\u26A0\uFE0F \uD559\uC0DD\uBA85\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694'); return; }
    if (!grade)       { showToast('\u26A0\uFE0F \uD559\uB144\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694'); return; }

    toggleLoading(true);
    try {
        const studentId = await generateUniqueStudentId(testDate, grade);
        const idEl = document.getElementById('input-student-id');
        if (idEl) idEl.value = studentId;

        const questionScores = [];
        let totalFromQ = 0, maxFromQ = 0;
        document.querySelectorAll('[id^="q-score-"]').forEach(inp => {
            const qid  = inp.dataset.qid;
            const maxQ = parseInt(inp.dataset.max) || 0;
            const sc   = parseInt(inp.value) || 0;
            totalFromQ += sc;
            maxFromQ   += maxQ;
            const q = (globalConfig.questions || []).find(q => String(q.id) === String(qid));
            questionScores.push({ no: q?.no||'', id: qid, type: q?.type||'',
                correct: null, studentAnswer: null, correctAnswer: null,
                score: sc, maxScore: maxQ });
        });

        // ?€?€ ?ì—­ë³„Â·ë‚œ?´ë„ë³??ìˆ˜ ê³„ì‚° ?€?€
        // ë¬¸í•­ë³??ìˆ˜ë¥??…ë ¥??ê²½ìš°: ê°?ë¬¸í•­??section/difficultyë¡??ë™ ?©ì‚°
        // ?„ì½”?”ì–¸ë§??…ë ¥??ê²½ìš°: ?´ë‹¹ ?…ë ¥ê°?ê·¸ë?ë¡??¬ìš© (?´ë°±)
        let grammarScore, writingScore, readingScore, listeningScore, vocabScore;

        // ì²´í¬ë°•ìŠ¤ "ë¬¸í•­ë³??ìˆ˜ ?•ë³´ ?†ìŒ" ?¬ë?ë¡?ë¶„ê¸°
        const noQScoreMode = document.getElementById('chk-no-qscore')?.checked;

        if (!noQScoreMode) {
            // ë¬¸í•­ë³??…ë ¥ ??section/difficulty ?ë™ ì§‘ê³„
            const calcS = (sec) => questionScores.reduce((sum, qs) => {
                const q = (globalConfig.questions || []).find(q => String(q.id) === String(qs.id));
                return sum + (q?.section === sec ? (qs.score || 0) : 0);
            }, 0);
            grammarScore   = calcS('Grammar');
            writingScore   = calcS('Writing');
            readingScore   = calcS('Reading');
            listeningScore = calcS('Listening');
            vocabScore     = calcS('Vocabulary');
        } else {
            // ?„ì½”?”ì–¸ ì§ì ‘ ?…ë ¥ ???´ë‹¹ ê°??¬ìš©
            grammarScore   = parseInt(document.getElementById('input-grammar')?.value)       || 0;
            writingScore   = parseInt(document.getElementById('input-writing')?.value)        || 0;
            readingScore   = parseInt(document.getElementById('input-reading')?.value)        || 0;
            listeningScore = parseInt(document.getElementById('input-listening')?.value)      || 0;
            vocabScore     = parseInt(document.getElementById('input-vocab')?.value)          || 0;
        }

        // ?€?€ ?ì—­ë³?ë§Œì : ë¬¸í•­ ë°°ì  ?©ì‚° ?€?€
        const catQs = (globalConfig.questions || []).filter(q => String(q.catId) === String(categoryId));
        const calcMax = (field, val) => catQs.filter(q => q[field] === val).reduce((s, q) => s + (parseInt(q.score) || 0), 0);
        const grammarMax   = calcMax('section', 'Grammar');
        const writingMax   = calcMax('section', 'Writing');
        const readingMax   = calcMax('section', 'Reading');
        const listeningMax = calcMax('section', 'Listening');
        const vocabMax     = calcMax('section', 'Vocabulary');

        const totalScore = !noQScoreMode
            ? totalFromQ
            : (grammarScore + writingScore + readingScore + listeningScore + vocabScore)
              || 0;
        const maxScore = !noQScoreMode
            ? maxFromQ
            : parseInt(document.getElementById('score-max-display')?.textContent) || 100;

        // ?€?€ ?œì´?„ë³„ ?ìˆ˜ ê³„ì‚° (ë¬¸í•­ë³??…ë ¥ ëª¨ë“œ?ì„œë§? ?€?€
        const difficulties = { 'ìµœìƒ':{score:0,max:0}, '??:{score:0,max:0}, 'ì¤?:{score:0,max:0}, '??:{score:0,max:0}, 'ê¸°ì´ˆ':{score:0,max:0} };
        if (!noQScoreMode) {
            questionScores.forEach(qs => {
                const q = catQs.find(q => String(q.id) === String(qs.id));
                const diff = q?.difficulty || 'ì¤?;
                if (difficulties[diff]) {
                    difficulties[diff].score += (qs.score || 0);
                    difficulties[diff].max   += (parseInt(q?.score) || 0);
                }
            });
        }

        const payload = {
            type: 'STUDENT_SAVE',
            parentFolderId: extractFolderId(category.targetFolderUrl),
            categoryId, categoryName: category.name,
            studentId, studentName, grade, studentClass, testDate,
            questionScores: JSON.stringify(questionScores),
            grammarScore,   grammarMax,
            writingScore,   writingMax,
            readingScore,   readingMax,
            listeningScore, listeningMax,
            vocabScore,     vocabMax,
            difficulty_highest: difficulties['ìµœìƒ'].score, difficulty_highest_max: difficulties['ìµœìƒ'].max,
            difficulty_high:    difficulties['??].score,   difficulty_high_max:    difficulties['??].max,
            difficulty_mid:     difficulties['ì¤?].score,   difficulty_mid_max:     difficulties['ì¤?].max,
            difficulty_low:     difficulties['??].score,   difficulty_low_max:     difficulties['??].max,
            difficulty_basic:   difficulties['ê¸°ì´ˆ'].score, difficulty_basic_max:   difficulties['ê¸°ì´ˆ'].max,
            inputMode: noQScoreMode ? 'section' : 'question',
            totalScore, maxScore
        };

        await sendReliableRequest(payload);
        showToast('\u2705 \uD559\uC0DD \uC131\uC801\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4!');
        clearScoreInputs(false, false);
    } catch (err) {
        console.error(err);
        showToast('\u26A0\uFE0F \uC800\uC7A5 \uC911 \uC624\uB958 \uBC1C\uC0DD: ' + err.message);
    } finally {
        toggleLoading(false);
    }
}

// --- ONLINE EXAM STUDENT SYSTEM ---


function startExamTimer() {
    if (examTimer) clearInterval(examTimer);

    const timerEl = document.getElementById('timer');
    const limitMin = examSession.timeLimit || 0;

    // ?€?´ë¨¸ ?…ë°?´íŠ¸ ?¨ìˆ˜
    const update = () => {
        if (!timerEl) return;
        const now = Date.now();
        const diffSec = Math.floor((now - examSession.startTime) / 1000); // ê²½ê³¼ ?œê°„(ì´?

        if (limitMin > 0) {
            // ì¹´ìš´?¸ë‹¤??ëª¨ë“œ
            const limitSec = limitMin * 60;
            const remainSec = limitSec - diffSec;

            if (remainSec <= 0) {
                timerEl.innerText = "00:00:00";
                timerEl.classList.add('text-red-600', 'animate-pulse');
                clearInterval(examTimer);
                examSession.isExamActive = false; // ?…ë ¥ ?„ì „ ì°¨ë‹¨

                // ëª¨ë“  ?…ë ¥ ë¹„í™œ?±í™” (?¼ë””??ë²„íŠ¼ ?¬í•¨ ?„ì²´ ?…ë ¥/?¼ë²¨ ì°¨ë‹¨)
                const examContainer = document.getElementById('exam-container');
                if (examContainer) {
                    // ?…ë ¥ ?„ë“œ ë°??ìŠ¤???ì—­ ë¹„í™œ?±í™”
                    examContainer.querySelectorAll('input, textarea, select').forEach(el => {
                        el.disabled = true;
                        el.style.opacity = '0.5';
                        el.style.cursor = 'not-allowed';
                    });
                    // ? íƒ??ê°€?¥í•œ ?¼ë²¨(Label) ?ì—­ ?´ë¦­ ë°©ì?
                    examContainer.querySelectorAll('label').forEach(lb => {
                        lb.style.pointerEvents = 'none';
                        lb.style.opacity = '0.5';
                        lb.style.cursor = 'not-allowed';
                    });
                }

                alert("?œí—˜ ?œê°„??ë§Œë£Œ?˜ì—ˆ?µë‹ˆ?? ?´ì œ ?…ë ¥??ë¶ˆê??¥í•©?ˆë‹¤.\n?˜ë‹¨???œì¶œ ë²„íŠ¼???ŒëŸ¬ ?œí—˜??ì¢…ë£Œ?˜ì„¸??");
                return;
            }

            const h = Math.floor(remainSec / 3600).toString().padStart(2, '0');
            const m = Math.floor((remainSec % 3600) / 60).toString().padStart(2, '0');
            const s = (remainSec % 60).toString().padStart(2, '0');
            timerEl.innerText = `${h}:${m}:${s}`;

            // 5ë¶?ë¯¸ë§Œ ??ê²½ê³  ?¨ê³¼
            if (remainSec < 300) timerEl.classList.add('text-red-600', 'animate-pulse');
            else timerEl.classList.remove('text-red-600', 'animate-pulse');

        } else {
            // ì¹´ìš´?¸ì—… ëª¨ë“œ (ê¸°ì¡´ ? ì?)
            const h = Math.floor(diffSec / 3600).toString().padStart(2, '0');
            const m = Math.floor((diffSec % 3600) / 60).toString().padStart(2, '0');
            const s = (diffSec % 60).toString().padStart(2, '0');
            timerEl.innerText = `${h}:${m}:${s}`;
        }
    };

    update(); // ì¦‰ì‹œ 1???¤í–‰
    examTimer = setInterval(update, 1000);
}

// [Removed] updateAnswer ì²?ë²ˆì§¸ ?•ì˜ ?? œ ???™ì¼ ?¨ìˆ˜ê°€ 3324ì¤„ì— ìµœì¢… ?•ì˜??

// [Refactored] Student Exam View System
let currentExamGridCols = 1;
let examPageSize = 12; // Default items per page (adjustable)

// [Main Entry] Render Exam Paper (Refactored)


// [Sub-component] Sidebar


// [Sub-function] Update Page
function updatePage(delta) {
    const units = examSession.displayUnits;
    if (!units) return;

    const totalPages = units.length;
    let newPage = examSession.currentPage + delta;

    if (newPage < 0) newPage = 0;
    if (newPage >= totalPages) newPage = totalPages - 1;

    if (newPage !== examSession.currentPage) {
        examSession.currentPage = newPage;
        renderExamContent();
        const scrollArea = document.getElementById('exam-scroll-area');
        if (scrollArea) scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// [Restored Feature] renderStudentSidebar
function renderStudentSidebar() {
    return `
        <div class="w-[300px] bg-white border-r border-black flex flex-col flex-shrink-0 z-50 shadow-sm relative transition-all duration-300 h-full">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50">
                 <span class="text-[14px] text-[#013976] font-black tracking-[0.2em] uppercase block mb-1">PassporT Student</span>
                 <h1 class="text-2xl font-black text-slate-800 tracking-tight leading-none">EXAM VIEW</h1>
            </div>

            <div class="p-6 space-y-4">
                 <div>
                    <div class="flex items-center gap-2">
                        <span class="text-[14px] text-[#013976] font-bold uppercase tracking-wider">Candidate</span>
                        <span class="text-[14px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">${examSession.grade}</span>
                        <span class="text-lg font-bold text-[#013976]">${examSession.studentName}</span>
                    </div>
                </div>

                <div class="bg-slate-900 rounded-xl p-5 text-center relative overflow-hidden group shadow-lg">
                    <span class="block text-[14px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Time Remaining</span>
                    <div id="timer" class="text-3xl font-mono font-bold text-white tracking-wider relative z-10">00:00:00</div>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-4 space-y-8">
                <div>
                    <span class="text-[14px] text-[#013976] font-bold uppercase tracking-wider block mb-3">PAGE NAVIGATION</span>
                    <div class="text-center mb-3">
                        <span id="page-indicator" class="text-2xl font-black text-[#013976]">1 / 1</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="updatePage(-1)" class="flex-1 py-3 bg-[#013976] text-white rounded-xl font-bold shadow-md hover:bg-blue-900 active:scale-95 transition-all flex justify-center items-center gap-2">Prev</button>
                        <button onclick="updatePage(1)" class="flex-1 py-3 bg-[#013976] text-white rounded-xl font-bold shadow-md hover:bg-blue-900 active:scale-95 transition-all flex justify-center items-center gap-2">Next</button>
                    </div>
                </div>

                <div>
                     <span class="text-[14px] text-[#013976] font-bold uppercase tracking-wider block mb-3">Progress Status</span>
                     <div class="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <div class="flex justify-between items-end mb-2">
                            <span class="text-2xl font-black text-[#013976]" id="progress-val">0%</span>
                            <span class="text-[14px] font-bold text-slate-500" id="progress-text">0 / 0</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div id="progress-bar" class="bg-blue-600 h-full rounded-full transition-all duration-500 w-0"></div>
                        </div>
                     </div>
                </div>
            </div>

            <div class="p-6 border-t border-slate-100 bg-slate-50/30">
                <button onclick="submitExam()" class="w-full py-4 bg-[#013976] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-900 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Submit Exam
                </button>
                <div class="text-center mt-3">
                     <button onclick="cancelExam()" class="text-[14px] text-slate-400 underline hover:text-red-500 transition-colors">Cancel Exam</button>
                </div>
            </div>
        </div>
    `;
}

// [Sub-function] Render Content Grid
// [Refactor] Render Exam Content (Column Distribution)
function renderExamContent() {
    const container = document.getElementById('exam-grid-container');
    const pageUnits = examSession.displayUnits;
    if (!container || !pageUnits) return;

    const totalPages = pageUnits.length;
    const currentUnit = pageUnits[examSession.currentPage];
    if (!currentUnit) return;

    // Update page indicator
    const indEl = document.getElementById('page-indicator');
    if (indEl) indEl.innerText = `${examSession.currentPage + 1} / ${totalPages}`;

    // Always 2-column grid
    container.className = 'w-full h-full grid grid-cols-2 divide-x divide-black bg-white';
    container.innerHTML = '';

    if (currentUnit.type === 'bundle') {
        // Left: passage + image (independent scroll)
        const leftCol = document.createElement('div');
        leftCol.className = 'h-full overflow-y-auto p-6 custom-scroll-wrapper';
        leftCol.innerHTML = renderBundleLeft(currentUnit.data);

        // Right: questions (independent scroll)
        const rightCol = document.createElement('div');
        rightCol.className = 'h-full overflow-y-auto p-6 custom-scroll-wrapper';
        rightCol.innerHTML = renderBundleRight(currentUnit.data);

        container.appendChild(leftCol);
        container.appendChild(rightCol);

    } else if (currentUnit.type === 'pair') {
        // Left: Q1, Right: Q2
        currentUnit.data.forEach(q => {
            const col = document.createElement('div');
            col.className = 'h-full overflow-y-auto p-6';
            col.innerHTML = `
                <div class="flex items-start gap-3 mb-2">
                    <div class="flex-shrink-0 w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-[15px] pt-0.5 shadow-sm">${q.displayIndex}</div>
                    <h4 class="text-[15px] font-normal text-slate-800 leading-snug pt-0.5 break-keep select-text">${q.text || ''}</h4>
                </div>
                ${q.passage1 && q.passage1.trim() !== '' ? '<div class="mb-3 p-3 bg-slate-100/50 border border-black rounded-lg text-[14px] leading-relaxed font-serif text-slate-700">' + q.passage1 + '</div>' : ''}
                ${getMediaHtml(q)}
                <div class="text-[14px]">${getInputHtml(q)}</div>
            `;
            container.appendChild(col);
        });

    } else if (currentUnit.type === 'solo') {
        // Left: single question
        const q = currentUnit.data;
        const leftCol = document.createElement('div');
        leftCol.className = 'h-full overflow-y-auto p-6';
        leftCol.innerHTML = `
            <div class="flex items-start gap-3 mb-2">
                <div class="flex-shrink-0 w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-[15px] pt-0.5 shadow-sm">${q.displayIndex}</div>
                <h4 class="text-[15px] font-normal text-slate-800 leading-snug pt-0.5 break-keep select-text">${q.text || ''}</h4>
            </div>
            ${q.passage1 && q.passage1.trim() !== '' ? '<div class="mb-3 p-3 bg-slate-100/50 border border-black rounded-lg text-[14px] leading-relaxed font-serif text-slate-700">' + q.passage1 + '</div>' : ''}
            ${getMediaHtml(q)}
            <div class="text-[14px]">${getInputHtml(q)}</div>
        `;

        // Right: continue message
        const rightCol = document.createElement('div');
        rightCol.className = 'h-full flex items-center justify-center bg-slate-50/30';
        rightCol.innerHTML = '<div class="text-center text-slate-400"><span class="text-4xl block mb-3">?“„</span><span class="text-[16px] font-medium">\ub2e4\uc74c \ud654\uba74\uc5d0 \ubb38\ud56d\uc774 \uacc4\uc18d\ub429\ub2c8\ub2e4.</span></div>';

        container.appendChild(leftCol);
        container.appendChild(rightCol);
    }

    updateProgressUI();
    setTimeout(setupScrollArrows, 50);
}

// [Restored Feature] updateProgressUI
function updateProgressUI() {
    // Simple calc
    let total = 0;
    if (globalConfig.questions) {
        total = globalConfig.questions.filter(q => String(q.catId) === String(examSession.categoryId)).length;
    }
    const answered = Object.keys(examSession.answers || {}).length;
    const pct = total === 0 ? 0 : Math.round((answered / total) * 100);

    const bar = document.getElementById('progress-bar');
    const txt = document.getElementById('progress-text');
    const val = document.getElementById('progress-val');

    if (bar) bar.style.width = `${pct}%`;
    if (txt) txt.innerText = `${answered} / ${total} Questions`;
    if (val) val.innerText = `${pct}%`;
}

// [Duplicate definitions removed]


// Removing duplicate definitions completely.


function renderExamResult(results, earned, total) {
    const percentage = Math.round((earned / total) * 100) || 0;
    const c = document.getElementById('dynamic-content');
    setCanvasId('02-2');
    // [Fix] dynamic-content ?ì²´ ?¤í???ê±´ë“œë¦¬ì? ?ŠìŒ ???˜í¼ div??ì¤‘ì•™?•ë ¬ ?ìš©
    c.style.cssText = '';

    c.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:center; width:100%; min-height:60vh;">
                    <div class="animate-fade-in-safe bg-white p-24 rounded-[2rem] border-2 border-[#013976]/20 flex flex-col items-center shadow-2xl">
                        <span class="text-6xl mb-8 font-black unified-animate">??/span>
                        <h2 class="fs-32 text-[#013976] font-black uppercase mb-4 leading-none text-center">?œì¶œ???„ë£Œ?˜ì—ˆ?µë‹ˆ??/h2>
                        <p class="fs-18 text-slate-400 tracking-tight mb-8 font-medium">Exam Submitted Successfully</p>
                        <div class="bg-blue-50 px-10 py-6 rounded-3xl mb-10 border border-blue-100">
                             <p class="text-blue-900 fs-18 font-bold">?˜ê³ ?˜ì…¨?µë‹ˆ??</p>
                        </div>
                        <button onclick="goHome()" class="btn-ys !px-16 !py-5 fs-18 shadow-lg">?  Back to Home</button>
                    </div>
                </div>
            `;
}

// ?™ìƒ ?±ì ??UI ?Œë”ë§?
// --- Missing Helper Functions Implementation ---

function getMediaHtml(q) {
    if (!q.imgUrl || q.imgUrl === "undefined" || q.imgUrl === "null") return "";

    // [Fix] Apply Google Drive URL Fixer
    const safeUrl = typeof fixDriveUrl === 'function' ? fixDriveUrl(q.imgUrl) : q.imgUrl;

    return `
        <div class="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img src="${safeUrl}" 
                 class="w-full h-auto object-contain mx-auto" 
                 alt="Question Image" 
                 loading="lazy"
                 onerror="this.style.display='none'; if(this.parentElement) this.parentElement.style.display='none';">
        </div>
    `;
}

function getInputHtml(q) {
    const savedAns = examSession.answers[q.id] || "";

    if (q.type === 'ê°ê??? || !q.type) { // Default to Objective
        // Ensure options exists
        let options = q.choices;
        if (typeof options === 'string') {
            try { options = JSON.parse(options); } catch (e) { options = []; }
        }
        if (!options || options.length === 0) return '<div class="text-red-500">ë³´ê¸° ?°ì´???†ìŒ</div>';

        return `
            <div class="space-y-3">
                ${options.map((opt, idx) => {
            const val = (idx + 1).toString();
            const isChecked = savedAns === val ? 'checked' : '';
            const isSelectedClass = savedAns === val ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 hover:bg-slate-50';

            return `
                    <label class="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 group/opt ${isSelectedClass}" onclick="updateAnswer('${q.id}', '${val}')">
                        <div class="relative flex items-center justify-center">
                            <input type="radio" name="q-${q.id}" value="${val}" ${isChecked} class="peer sr-only" onchange="updateAnswer('${q.id}', '${val}')">
                            <div class="w-6 h-6 rounded-full border-2 border-slate-300 peer-checked:border-indigo-500 peer-checked:bg-indigo-500 transition-all flex items-center justify-center">
                                <div class="w-2.5 h-2.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                        <span class="fs-16 text-slate-700 font-medium group-hover/opt:text-slate-900">${opt}</span>
                    </label>
                    `;
        }).join('')}
            </div>
        `;
    } else {
        // Subjective
        return `
            <textarea class="w-full p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all fs-16 resize-none min-h-[120px]" 
                placeholder="?µì•ˆ???…ë ¥?˜ì„¸??.." 
                oninput="updateAnswer('${q.id}', this.value)">${savedAns}</textarea>
        `;
    }
}

function updateAnswer(qId, value) {
    if (!examSession.answers) examSession.answers = {};
    examSession.answers[qId] = value;
    updateProgressUI();

    // Force UI refresh for the specific question's options if needed
    const inputs = document.getElementsByName(`q-${qId}`);
    if (inputs) {
        inputs.forEach(input => {
            const label = input.closest('label');
            if (label) {
                if (input.value === value) {
                    label.classList.add('border-indigo-500', 'bg-indigo-50', 'ring-1', 'ring-indigo-500');
                    label.classList.remove('border-slate-200', 'hover:bg-slate-50');
                    input.checked = true;
                } else {
                    label.classList.remove('border-indigo-500', 'bg-indigo-50', 'ring-1', 'ring-indigo-500');
                    label.classList.add('border-slate-200', 'hover:bg-slate-50');
                    input.checked = false;
                }
            }
        });
    }
}

async function submitExam() {
    if (!confirm("?œí—˜???œì¶œ?˜ì‹œê² ìŠµ?ˆê¹Œ?")) return;

    toggleLoading(true);

    try {
        // Calculate Scores
        let totalScore = 0;
        let maxScore = 0;

        // Define Sections
        const sections = {
            'Grammar': { score: 0, max: 0 },
            'Writing': { score: 0, max: 0 },
            'Reading': { score: 0, max: 0 },
            'Listening': { score: 0, max: 0 },
            'Vocabulary': { score: 0, max: 0 }
        };

        // Define Difficulties
        const difficulties = {
            'ìµœìƒ': { score: 0, max: 0 },
            '??: { score: 0, max: 0 },
            'ì¤?: { score: 0, max: 0 },
            '??: { score: 0, max: 0 },
            'ê¸°ì´ˆ': { score: 0, max: 0 }
        };

        const questionScores = [];
        const rawQuestions = globalConfig.questions.filter(q => String(q.catId) === String(examSession.categoryId));

        // [Fix] ë¬¶ìŒ ì§€ë¬??°ì´??ì£¼ì… (AI ì±„ì  ??ì§€ë¬?ë¬¸ë§¥ ?„ë‹¬???„í•´)
        const questions = rawQuestions.map(q => {
            const copy = { ...q };
            if (copy.setId) {
                const bundle = globalConfig.bundles ? globalConfig.bundles.find(b => b.id === copy.setId) : null;
                if (bundle) {
                    copy.bundlePassageText = bundle.text;
                    copy.commonTitle = bundle.title;
                }
            }
            return copy;
        });

        for (const q of questions) {
            const studentAns = examSession.answers[q.id] || "";
            let earnedScore = 0;
            let isCorrect = false;
            const maxQ = parseInt(q.score) || 0;
            const correctAns = String(q.answer || '').trim();

            if (q.type === 'ê°ê???) {
                // ê°ê??? ?¨ìˆœ ë¬¸ì??ë¹„êµ
                isCorrect = String(studentAns).trim() === String(q.answer).trim();
                earnedScore = isCorrect ? maxQ : 0;
            } else {
                // ì£¼ê??? 1?¨ê³„ ?¤ì›Œ??ë§¤ì¹­ ??2?¨ê³„ AI ì±„ì 
                if (!studentAns.trim()) {
                    // ë¯¸ë‹µë³€ ??0??
                    isCorrect = false;
                    earnedScore = 0;
                } else if (correctAns) {
                    // 1?¨ê³„: ê´€?€???¤ì›Œ??ë§¤ì¹­ (?€?Œë¬¸?Â·ë„?´ì“°ê¸°Â·êµ¬?ì  ë¬´ì‹œ)
                    const normalize = s => s.toLowerCase().replace(/[\s,.\-_'"!?;:()`\u2018\u2019\u201C\u201D]/g, '').trim();
                    const acceptableAnswers = correctAns.split(',').map(a => normalize(a));
                    const normalizedStudentAns = normalize(String(studentAns));
                    isCorrect = acceptableAnswers.includes(normalizedStudentAns);
                    earnedScore = isCorrect ? maxQ : 0;
                }

                // 2?¨ê³„: ?¤ì›Œ??ë§¤ì¹­ ?¤íŒ¨ ??AI ì±„ì  ?œë„
                if (!isCorrect && studentAns.trim() && globalConfig.geminiKey) {
                    try {
                        const aiResult = await gradeWithAI(q, studentAns);
                        if (aiResult && aiResult.score !== undefined) {
                            earnedScore = Math.min(Math.max(0, Math.round(aiResult.score)), maxQ);
                            isCorrect = earnedScore >= maxQ; // ë§Œì ?´ë©´ O ?œì‹œ
                            console.log(`?¤– AI ì±„ì  [ë¬¸í•­ ${q.no}]: ${earnedScore}/${maxQ} (${aiResult.feedback})`);
                        }
                    } catch (aiErr) {
                        console.warn(`? ï¸ AI ì±„ì  ?¤íŒ¨ [ë¬¸í•­ ${q.no}]:`, aiErr.message);
                        // AI ?¤íŒ¨ ??0??? ì?
                    }
                }
            }

            totalScore += earnedScore;
            maxScore += maxQ;

            // Section Stats
            const sec = q.section || 'Reading';
            if (sections[sec]) {
                sections[sec].score += earnedScore;
                sections[sec].max += maxQ;
            }

            // Difficulty Stats
            const diff = q.difficulty || 'ì¤?;
            if (difficulties[diff]) {
                difficulties[diff].score += earnedScore;
                difficulties[diff].max += maxQ;
            }

            questionScores.push({
                no: q.no,
                id: q.id,
                type: q.type,
                section: sec,
                difficulty: diff,
                correct: isCorrect,
                studentAnswer: studentAns,
                correctAnswer: q.answer,
                score: earnedScore,
                maxScore: maxQ,
                _gradingV2: true
            });
        }

        // Prepare Payload
        const category = globalConfig.categories.find(c => String(c.id) === String(examSession.categoryId));
        const targetFolderId = category ? extractFolderId(category.targetFolderUrl) : "";

        const apiPayload = {
            type: 'STUDENT_SAVE',
            categoryId: examSession.categoryId,
            categoryName: category?.name || "Unknown",
            parentFolderId: targetFolderId,
            testDate: examSession.date,
            studentId: examSession.studentId,
            studentName: examSession.studentName,
            grade: examSession.grade,

            questionScores: JSON.stringify(questionScores),

            grammarScore: sections['Grammar'].score,   grammarMax: sections['Grammar'].max,
            writingScore: sections['Writing'].score,   writingMax: sections['Writing'].max,
            readingScore: sections['Reading'].score,   readingMax: sections['Reading'].max,
            listeningScore: sections['Listening'].score, listeningMax: sections['Listening'].max,
            vocabScore: sections['Vocabulary'].score,  vocabMax: sections['Vocabulary'].max,

            difficulty_highest: difficulties['ìµœìƒ'].score, difficulty_highest_max: difficulties['ìµœìƒ'].max,
            difficulty_high:    difficulties['??].score,   difficulty_high_max:    difficulties['??].max,
            difficulty_mid:     difficulties['ì¤?].score,   difficulty_mid_max:     difficulties['ì¤?].max,
            difficulty_low:     difficulties['??].score,   difficulty_low_max:     difficulties['??].max,
            difficulty_basic:   difficulties['ê¸°ì´ˆ'].score, difficulty_basic_max:   difficulties['ê¸°ì´ˆ'].max,

            totalScore: totalScore,
            maxScore: maxScore
        };

        // ?€?€ ì§„ë‹¨??ë¡œê·¸ (F12 ì½˜ì†”?ì„œ ?•ì¸) ?€?€
        console.log("=== SUBMIT PAYLOAD ?ê? ===");
        console.log("Fields:", Object.keys(apiPayload).join(', '));
        console.log("totalScore:", apiPayload.totalScore, "| maxScore:", apiPayload.maxScore);
        console.log("studentClass ì¡´ì¬?¬ë?:", 'studentClass' in apiPayload, "| inputMode ì¡´ì¬?¬ë?:", 'inputMode' in apiPayload);
        console.log("Full payload:", JSON.stringify(apiPayload, null, 2));

        // Send to Backend
        await sendReliableRequest(apiPayload);

        // Success UI
        renderExamResult(questionScores, totalScore, maxScore);

    } catch (e) {
        console.error(e);
        showToast("???œì¶œ ?¤íŒ¨: " + e.message);
        alert("?œì¶œ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤: " + e.message);
    } finally {
        toggleLoading(false);
    }
}

// ?™ìƒ ?±ì ??UI ?Œë”ë§?(?œí—˜ì§€?’ë…„?„â†’?™ë…„?’í•™??ê³„ë‹¨???„í„°)
function renderRecords(c) {
    if (!globalConfig.categories || globalConfig.categories.length === 0) {
        renderEmptyState(c, 'Individual Reports');
        return;
    }

    setCanvasId('05');
    const boxStyle = `background: linear-gradient(135deg, #ffffff 0%, #eef4ff 100%); border: 2px solid rgba(1,57,118,0.15);`;
    const topBar = `<div style="position:absolute; top:0; left:0; right:0; height:3px; background: linear-gradient(90deg, #60a5fa, #6366f1, #a855f7);"></div>`;
    c.innerHTML = `
        <div class="animate-fade-in-safe space-y-6">
            <div class="relative no-print">
                <h2 class="fs-32 text-[#013976] leading-none font-black uppercase !border-none !pb-0">Individual Reports</h2>
                <button onclick="printReport()" class="absolute right-0 flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-700 text-white font-bold fs-15 hover:bg-slate-900 transition-all active:scale-95 shadow" style="top:50%; transform:translateY(-50%);">?–¨ï¸??¸ì‡„</button>
            </div>

            <!-- ?œí—˜ì§€ Â· ?„ë„ Â· ?™ë…„ Â· ?™ìƒ ? íƒ (4?¨ê³„ ê³„ë‹¨?? -->
            <div class="grid grid-cols-4 gap-4 no-print">
                <!-- Box 1: ?œí—˜ì§€ -->
                <div class="card !p-6 flex flex-col justify-center shadow-lg relative overflow-hidden" style="${boxStyle}">
                    ${topBar}
                    <div class="space-y-3">
                        <label class="ys-label !mb-0 !text-[#013976] font-bold">?“‚ ?œí—˜ì§€ ? íƒ</label>
                        <select id="report-category" onchange="onReportCategoryChange();" class="ys-field w-full !font-normal !text-[#013976] !bg-white !text-[16px]">
                            <option value="" disabled selected hidden>?œí—˜ì§€ë¥?? íƒ?˜ì„¸??/option>
                            ${globalConfig.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- Box 2: ?„ë„ -->
                <div class="card !p-6 flex flex-col justify-center shadow-lg relative overflow-hidden" style="${boxStyle}">
                    ${topBar}
                    <div class="space-y-3">
                        <label class="ys-label !mb-0 !text-[#013976] font-bold">?“… ?„ë„ ? íƒ</label>
                        <select id="report-year" onchange="onReportYearChange();" class="ys-field w-full !font-normal !text-[#013976] !bg-white !text-[16px]" disabled>
                            <option value="" disabled selected hidden>?œí—˜ì§€ ë¨¼ì? ? íƒ</option>
                        </select>
                    </div>
                </div>

                <!-- Box 3: ?™ë…„ -->
                <div class="card !p-6 flex flex-col justify-center shadow-lg relative overflow-hidden" style="${boxStyle}">
                    ${topBar}
                    <div class="space-y-3">
                        <label class="ys-label !mb-0 !text-[#013976] font-bold">?“ ?™ë…„ ? íƒ</label>
                        <select id="report-grade" onchange="onReportGradeChange();" class="ys-field w-full !font-normal !text-[#013976] !bg-white !text-[16px]" disabled>
                            <option value="" disabled selected hidden>?„ë„ ë¨¼ì? ? íƒ</option>
                        </select>
                    </div>
                </div>

                <!-- Box 4: ?™ìƒ -->
                <div class="card !p-6 flex flex-col justify-center shadow-lg relative overflow-hidden" style="${boxStyle}">
                    ${topBar}
                    <div class="space-y-3">
                        <label class="ys-label !mb-0 !text-[#013976] font-bold">?‘¤ ?™ìƒ ? íƒ</label>
                        <select id="report-student" onchange="loadStudentReport();" class="ys-field w-full !font-normal !text-[#013976] !bg-white !text-[16px]" disabled>
                            <option value="" disabled selected hidden>?™ìƒ??? íƒ?˜ì„¸??/option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- ?±ì ???œì‹œ ?ì—­ -->
            <div id="report-display"></div>
        </div>
    `;
}

// ?™ìƒ ëª©ë¡ ë¡œë“œ
async function loadStudentList() {
    const categoryId = document.getElementById('report-category')?.value;
    if (!categoryId) return;

    const category = globalConfig.categories.find(c => c.id === categoryId);
    if (!category) return;

    // Debugging: Log the category and folder ID
    console.log("Loading list for category:", category);
    const folderId = extractFolderId(category.targetFolderUrl);
    console.log("Extracted Folder ID:", folderId);

    if (!folderId || folderId.length < 5) {
        showToast("? ï¸ ? íš¨???´ë” IDê°€ ?†ìŠµ?ˆë‹¤. ì¹´í…Œê³ ë¦¬ ?¤ì •???•ì¸?´ì£¼?¸ìš”.");
        return;
    }

    toggleLoading(true);
    try {
        // [Fix] Backend only supports GET_STUDENT_LIST, not RECORDS
        const payload = {
            type: 'GET_STUDENT_LIST',
            parentFolderId: folderId,
            categoryName: category.name
        };

        // Use Reliable Request
        const result = await sendReliableRequest(payload);

        if (result.status === "Success") {
            const records = result.data || result.records || [];
            window.cachedStudentRecords = records;

            if (!records || !Array.isArray(records) || records.length === 0) {
                showToast('? ï¸ ?™ìƒ ?°ì´?°ê? ?†ìŠµ?ˆë‹¤.');
                const yearSel = document.getElementById('report-year');
                if (yearSel) { yearSel.innerHTML = '<option value="" disabled selected hidden>?°ì´???†ìŒ</option>'; yearSel.disabled = true; }
                return;
            }
            populateYearDropdown(records);
        } else {
            throw new Error(result.message || "Unknown Server Error");
        }
    } catch (err) {
        console.error("Load Error:", err);
        showToast(`??ë¡œë“œ ?¤íŒ¨: ${err.message}`);
    } finally {
        toggleLoading(false);
    }
}

// ?€?€ ?œí—˜ì§€ ? íƒ ???¸ì¶œ (reset + load)
async function onReportCategoryChange() {
    const yearSel  = document.getElementById('report-year');
    const gradeSel = document.getElementById('report-grade');
    const stuSel   = document.getElementById('report-student');
    if (yearSel)  { yearSel.innerHTML  = '<option value="" disabled selected hidden>ë¶ˆëŸ¬?¤ëŠ” ì¤?..</option>'; yearSel.disabled  = true; }
    if (gradeSel) { gradeSel.innerHTML = '<option value="" disabled selected hidden>?„ë„ ë¨¼ì? ? íƒ</option>';  gradeSel.disabled = true; }
    if (stuSel)   { stuSel.innerHTML   = '<option value="" disabled selected hidden>?™ìƒ??? íƒ?˜ì„¸??/option>'; stuSel.disabled   = true; }
    const rpt = document.getElementById('report-display');
    if (rpt) rpt.innerHTML = '';
    await loadStudentList();
}

// ?€?€ ë¡œë“œ???ˆì½”?œë¡œ ?„ë„ ?œë¡­?¤ìš´ ì±„ìš°ê¸?
function populateYearDropdown(records) {
    const yearSel = document.getElementById('report-year');
    if (!yearSel) return;
    const years = [...new Set(
        records.map(r => String(r['?‘ì‹œ??] || r.date || '').substring(0, 4))
               .filter(y => /^\d{4}$/.test(y))
    )].sort((a, b) => b.localeCompare(a)); // ìµœì‹ ?„ë„ ë¨¼ì?
    yearSel.innerHTML = '<option value="?„ì²´">?„ì²´</option>' +
        years.map(y => `<option value="${y}">${y}??/option>`).join('');
    yearSel.disabled = false;
    yearSel.value = '?„ì²´';
    onReportYearChange();
}

// ?€?€ ?„ë„ ? íƒ ?????™ë…„ ?œë¡­?¤ìš´ ì±„ìš°ê¸?
function onReportYearChange() {
    const year    = document.getElementById('report-year')?.value;
    const records = window.cachedStudentRecords || [];
    const filtered = (!year || year === '?„ì²´') ? records
        : records.filter(r => String(r['?‘ì‹œ??] || r.date || '').substring(0, 4) === year);

    const gradeSel = document.getElementById('report-grade');
    const stuSel   = document.getElementById('report-student');
    if (!gradeSel) return;

    const grades = [...new Set(
        filtered.map(r => String(r['?™ë…„'] || r.grade || '')).filter(g => g)
    )].sort((a, b) => a.localeCompare(b, 'ko'));

    gradeSel.innerHTML = '<option value="?„ì²´">?„ì²´</option>' +
        grades.map(g => `<option value="${g}">${g}</option>`).join('');
    gradeSel.disabled = false;
    gradeSel.value = '?„ì²´';

    if (stuSel) { stuSel.innerHTML = '<option value="" disabled selected hidden>?™ìƒ??? íƒ?˜ì„¸??/option>'; stuSel.disabled = true; }
    const rpt = document.getElementById('report-display');
    if (rpt) rpt.innerHTML = '';
    onReportGradeChange();
}

// ?€?€ ?™ë…„ ? íƒ ?????™ìƒ ?œë¡­?¤ìš´ ì±„ìš°ê¸?
function onReportGradeChange() {
    const year  = document.getElementById('report-year')?.value;
    const grade = document.getElementById('report-grade')?.value;
    const records = window.cachedStudentRecords || [];

    let filtered = records;
    if (year  && year  !== '?„ì²´') filtered = filtered.filter(r => String(r['?‘ì‹œ??] || r.date || '').substring(0, 4) === year);
    if (grade && grade !== '?„ì²´') filtered = filtered.filter(r => String(r['?™ë…„'] || r.grade || '') === grade);

    const stuSel = document.getElementById('report-student');
    if (!stuSel) return;

    const idKeys   = ['?™ìƒID', 'studentId', 'id'];
    const nameKeys = ['?™ìƒëª?, 'studentName', 'name', '?´ë¦„'];
    const getV = (rec, keys) => { for (const k of keys) { if (rec[k] !== undefined && rec[k] !== '') return rec[k]; } return null; };

    const studentMap = new Map();
    filtered.forEach(r => {
        const id = getV(r, idKeys), name = getV(r, nameKeys);
        if (id && name) studentMap.set(String(id), String(name));
    });

    if (studentMap.size === 0) {
        stuSel.innerHTML = '<option value="" disabled selected hidden>?´ë‹¹ ì¡°ê±´???™ìƒ ?†ìŒ</option>';
        stuSel.disabled = true;
        return;
    }
    const sorted = Array.from(studentMap.entries()).sort((a, b) => String(a[1]).localeCompare(String(b[1]), 'ko'));
    stuSel.innerHTML = '<option value="" disabled selected hidden>?™ìƒ??? íƒ?˜ì„¸??/option>' +
        sorted.map(([id, name]) => `<option value="${id}">${name}</option>`).join('');
    stuSel.disabled = false;
    const rpt = document.getElementById('report-display');
    if (rpt) rpt.innerHTML = '';
    showToast(`??${studentMap.size}ëª?ì¡°íšŒ??);
}
// ?™ë…„ë³?AI ?¤ì•¤ë§¤ë„ˆ ?•ì˜
function getGradeTone(grade) {
    const g = String(grade || '').trim();
    const HONORIFIC = '\n[?„ìˆ˜ ê·œì¹™] ëª¨ë“  ë¬¸ì¥?€ ë°˜ë“œ??~?‚ë‹ˆ??~?µë‹ˆ???•ì‹??ê²©ì‹ ì¡´ëŒ“ë§ë¡œ ?‘ì„±?˜ì„¸?? ~?? ~?¤ìš”, ~ê±°ì˜ˆ?????´ìš”ì²´ëŠ” ?ˆë? ?¬ìš©?˜ì? ë§ˆì„¸?? ë°˜ë§???ˆë? ê¸ˆì??…ë‹ˆ?? ë¬¸ë‹¨ ?¬ì´??ë¹?ì¤„ì„ ?£ì? ë§ˆì„¸??';
    // ì´ˆë“±: ì´?~6
    if (/^ì´?1-6]$/.test(g) || /^ì´ˆë“±/.test(g)) {
        return `?¹ì‹ ?€ ì´ˆë“±?™êµ ?ì–´ ?™ìƒ???„í•œ ì¹œì ˆ??? ìƒ?˜ì…?ˆë‹¤.
[?¤ì•¤ë§¤ë„ˆ] ?°ëœ»?˜ê³  ì¹œê·¼??ë§íˆ¬ë¡??‘ì„±?˜ì„¸?? ?´ë ¤???©ì–´???°ì? ë§ˆì„¸?? ì¹?°¬??ë¨¼ì? ì¶©ë¶„???˜ê³ , ê°œì„ ?ì? "?¤ìŒ???´ë ‡ê²??´ë³´ë©??´ë–¨ê¹Œìš”?" ê°™ì´ ë¶€?œëŸ½ê²??œì•ˆ?˜ì„¸?? ??ƒ ê²©ë ¤ë¡?ë§ˆë¬´ë¦¬í•˜?¸ìš”.${HONORIFIC}`;
    }
    // ê³ ë“±: ê³?~3
    if (/^ê³?1-3]$/.test(g) || /^ê³ ë“±/.test(g)) {
        return `?¹ì‹ ?€ ê³ ë“±?™êµ ?ì–´ ?™ìƒ???„í•œ ?„ë¬¸ ê°•ì‚¬?…ë‹ˆ??
[?¤ì•¤ë§¤ë„ˆ] ?„ë¬¸?ì´ê³?ê°„ê²°???´ì¡°ë¡??‘ì„±?˜ì„¸?? ?˜ëŠ¥/?´ì‹ ??ê°ì•ˆ???¤ì§ˆ?ì¸ ?™ìŠµ ?„ëµ???œì‹œ?˜ì„¸?? ê²©ë ¤????ë¬¸ì¥?¼ë¡œ ê°„ê²°?˜ê²Œ ?˜ê³ , ë¶„ì„ê³??™ìŠµ ë°©í–¥ ?œì‹œ??ì§‘ì¤‘?˜ì„¸??${HONORIFIC}`;
    }
    // ì¤‘ë“±: ì¤?~3 (ê¸°ë³¸ê°?
    return `?¹ì‹ ?€ ì¤‘í•™êµ??ì–´ ?™ìƒ???„í•œ ?ì–´ ê°•ì‚¬?…ë‹ˆ??
[?¤ì•¤ë§¤ë„ˆ] ì§ì ‘?ì´??ì¡´ì¤‘?˜ëŠ” ?¤ìœ¼ë¡??‘ì„±?˜ì„¸?? ë¶€ì¡±í•œ ë¶€ë¶„ì? ëª…í™•?˜ê²Œ ì§€?í•˜?? ?„ì „ ?˜ìš•??ë¶ˆëŸ¬?¼ìœ¼?¤ëŠ” ?¸ì–´ë¥??¬ìš©?˜ì„¸?? ?™ìƒ ?¤ìŠ¤ë¡?ëª©í‘œë¥??¸ìš¸ ???ˆë„ë¡?êµ¬ì²´?ì¸ ë°©í–¥???œì‹œ?˜ì„¸??${HONORIFIC}`;
}

// AI ì¢…í•© ì½”ë©˜???ì„± (?ì—­ë³?ì½”ë©˜??ê¸°ë°˜ ì¢…í•©ë¶„ì„)
async function generateOverallComment(record, averages, activeSections, sectionComments = {}) {
    const secMap = {
        'Grammar': 'grammarScore', 'Writing': 'writingScore',
        'Reading': 'readingScore', 'Listening': 'listeningScore', 'Vocabulary': 'vocabScore'
    };
    const maxMap = {
        'Grammar': 'grammarMax', 'Writing': 'writingMax',
        'Reading': 'readingMax', 'Listening': 'listeningMax', 'Vocabulary': 'vocabMax'
    };

    const totalScore = parseFloat(record['ì´ì '] || record.totalScore || 0);
    const totalMax   = parseFloat(record['ë§Œì '] || record.maxScore || 100);
    const totalAvg   = parseFloat(averages['ì´ì '] || 0);
    const totalRate  = totalMax > 0 ? (totalScore / totalMax * 100).toFixed(1) : '?';
    const totalLevel = (totalScore / totalMax * 100) >= 90 ? '?°ìˆ˜' : (totalScore / totalMax * 100) >= 70 ? 'ë³´í†µ' : 'ë¶€ì§?;

    const gradeTone = getGradeTone(record.grade || record['?™ë…„']);

    const sectionSummary = activeSections.map(s => {
        const score = parseFloat(record[s + '_?ìˆ˜'] || record[secMap[s]] || 0);
        const max   = parseFloat(record[s + '_ë§Œì '] || record[maxMap[s]] || averages[maxMap[s]] || 0);
        const avg   = parseFloat(averages[s + '_?ìˆ˜'] || averages[secMap[s]] || 0);
        const cmt   = sectionComments[s] || '(ì½”ë©˜???†ìŒ)';
        return `[?ì—­: ${s}] ê°œì¸ ${score}??/ ë§Œì  ${max > 0 ? max + '?? : '?'} / ?‰ê·  ${avg.toFixed(1)}??n?ì—­ ì½”ë©˜?? ${cmt}`;
    }).join('\n\n');

    const prompt = `${gradeTone}

?„ë˜ ?™ìƒ???ì—­ë³?ì½”ë©˜?¸ë? ì¢…í•©???„ì²´ ?¼ë“œë°±ì„ ?‘ì„±?´ì£¼?¸ìš”.

[?ì—­ë³?ë¶„ì„ ?”ì•½]
${sectionSummary}

[ì´ì  ?„í™©]
ê°œì¸ ì´ì : ${totalScore}??/ ?œí—˜ì§€ ë§Œì : ${totalMax}??/ ë°??‰ê· : ${totalAvg.toFixed(1)}??/ ?•ë‹µë¥? ${totalRate}% / ?±ì·¨?ˆë²¨: ${totalLevel}

[?‘ì„± ê·œì¹™]
1) ê°??ì—­?ì„œ??ê°•ì  ì¢…í•© (1~2ë¬¸ì¥)
2) ë¶€ì¡±í•œ ?ì—­ê³?ì½”ë©˜?¸ë? ë°”íƒ•?¼ë¡œ ?¤ì§ˆ???™ìŠµ ë°©í–¥ (1~2ë¬¸ì¥)
3) ?„ì²´??ê²©ë ¤ ë©”ì‹œì§€ (1ë¬¸ì¥)

?¤ì œ ì´ì /ë§Œì ??ë°˜ë“œ???¸ê¸‰?˜ì„¸?? ?™ì›ëª? êµì¬ëª? ë¸Œëœ?œëª…?€ ?ˆë? ?¸ê¸‰?˜ì? ë§ˆì„¸?? ëª¨ë“  ?µë??€ ?œìˆ˜ ?œêµ­?´ë¡œë§??‘ì„±?˜ì„¸??`;

    return await callGeminiAPI(prompt);
}

// ?™ìƒ ?±ì ??ë¡œë“œ ë°??œì‹œ
async function loadStudentReport() {
    const studentId = document.getElementById('report-student')?.value;
    if (!studentId) {
        document.getElementById('report-display').innerHTML = '';
        return;
    }

    const categoryId = document.getElementById('report-category').value;
    const category = globalConfig.categories.find(c => c.id === categoryId);

    toggleLoading(true);
    try {
        const payload = {
            type: 'GET_STUDENT_REPORT', // [Fix] Use correct backend handler
            parentFolderId: extractFolderId(category.targetFolderUrl),
            categoryName: category.name,
            studentId: studentId // [Fix] Send studentId to backend
        };

        const result = await sendReliableRequest(payload);

        // [Fix] ë¬¸í•­ë³??ì„¸ë³´ê¸°ë¥??„í•´ ?´ë‹¹ ì¹´í…Œê³ ë¦¬??ë¬¸í•­ ?°ì´?°ê? ?†ìœ¼ë©?ë°±ì—”?œì—??ì§ì ‘ ë¡œë“œ
        const catQuestions = (globalConfig.questions || []).filter(q => String(q.catId) === String(categoryId));
        if (catQuestions.length === 0) {
            console.log('?“¦ ?±ì ?œìš© ë¬¸í•­ ?°ì´??ë°±ì—”??ë¡œë“œ:', category.name);
            try {
                const folderId = extractFolderId(category.targetFolderUrl);
                const qResult = await sendReliableRequest({
                    type: 'GET_FULL_DB',
                    parentFolderId: folderId,
                    categoryName: category.name
                });
                if (qResult.status === 'Success' && qResult.questions && qResult.questions.length > 0) {
                    const fetched = qResult.questions.map(q => ({ ...q, catId: categoryId }));
                    if (!globalConfig.questions) globalConfig.questions = [];
                    globalConfig.questions.push(...fetched);
                    // ë²ˆë“¤ ?°ì´?°ë„ ?€??
                    if (qResult.bundles && qResult.bundles.length > 0) {
                        if (!globalConfig.bundles) globalConfig.bundles = [];
                        globalConfig.bundles.push(...qResult.bundles.map(b => ({ ...b, catId: categoryId })));
                    }
                    save();
                    console.log(`??ë¬¸í•­ ${fetched.length}ê°?ë¡œë“œ ?„ë£Œ`);
                }
            } catch (e) {
                console.warn('? ï¸ ë¬¸í•­ ?°ì´??ë¡œë“œ ?¤íŒ¨:', e.message);
            }
        }

        if (result.status === "Success" && result.data) {
            const report = result.data;

            // Report rendering logic (using single report object)
            // Note: The original code expected an array of records and calculated averages client-side.
            // But GET_STUDENT_REPORT returns a single PRE-CALCULATED report from the sheet row.
            // If we need class averages, we might need a separate call or the backend should return them.
            // For now, let's render the individual report.

            // Check if averages are needed. Original code: calculateAverages(result.records).
            // If result.records is missing (which it is for REPORT type), we can't calc averages client-side.
            // However, the report usually contains the student's score and max score.
            // Let's assume for now we display the individual report.
            // If class average comparison is critical, we need GET_STUDENT_LIST (which returns all basic info)
            // or GET_STUDENT_RECORDS (which we established DOES NOT EXIST).
            // Actually, `GET_STUDENT_LIST` returns basic info (date, id, name, grade) but NOT scores.
            // So to calculate averages client-side, we would need ALL students' full records.
            // Since backend doesn't support "Get All Full Records", we might be limited to single report.
            // OR, we can ask backend to calculate averages?
            // The GS code for GET_STUDENT_REPORT only finds the specific row.

            // ?‰ê·  ê³„ì‚° (ìºì‹œ???„ì²´ ?™ìƒ ?°ì´???¬ìš©)
            const allRecords = window.cachedStudentRecords || [];
            const validRecs  = allRecords.filter(r => {
                const v = r['ì´ì '] ?? r.totalScore;
                return v !== undefined && v !== '' && v !== null;
            });
            const cnt = validRecs.length || 1;
            const avgOf = (koKey, enKey) =>
                validRecs.reduce((sum, r) => sum + parseFloat(r[koKey] || r[enKey] || 0), 0) / cnt;

            const allSections = ['Grammar', 'Writing', 'Reading', 'Listening', 'Vocabulary'];
            const secMap = {
                'Grammar': 'grammarScore', 'Writing': 'writingScore',
                'Reading': 'readingScore', 'Listening': 'listeningScore', 'Vocabulary': 'vocabScore'
            };

            const averages = {
                'ì´ì ':           avgOf('ì´ì ', 'totalScore'),
                'ë§Œì ':           parseFloat(report['ë§Œì '] || report.maxScore || 100),
                grammarScore:   avgOf('Grammar_?ìˆ˜',   'grammarScore'),
                writingScore:   avgOf('Writing_?ìˆ˜',   'writingScore'),
                readingScore:   avgOf('Reading_?ìˆ˜',   'readingScore'),
                listeningScore: avgOf('Listening_?ìˆ˜', 'listeningScore'),
                vocabScore:     avgOf('Vocabulary_?ìˆ˜','vocabScore'),
            };
            averages['Grammar_?ìˆ˜']   = averages.grammarScore;
            averages['Writing_?ìˆ˜']   = averages.writingScore;
            averages['Reading_?ìˆ˜']   = averages.readingScore;
            averages['Listening_?ìˆ˜'] = averages.listeningScore;
            averages['Vocabulary_?ìˆ˜']= averages.vocabScore;

            const activeSections = allSections.filter(section => {
                const score = report[section + '_?ìˆ˜'] !== undefined
                    ? parseFloat(report[section + '_?ìˆ˜'])
                    : parseFloat(report[secMap[section]] || 0);
                return score > 0;
            });

            const savedSections = report.aiSectionComments || {};
            const savedOverall  = report.aiOverallComment  || null;
            window.currentReportData = { record: report, averages, activeSections, sectionComments: savedSections, overallComment: savedOverall };

            renderReportCard(report, averages, savedSections, savedOverall, activeSections);
            showToast(`???±ì ??ë¡œë“œ ?„ë£Œ (?‰ê·  ${validRecs.length}ëª?ê¸°ì?)`);

        } else {
            document.getElementById('report-display').innerHTML = '<div class="card text-center text-slate-500">?±ì  ?°ì´?°ë? ì°¾ì„ ???†ìŠµ?ˆë‹¤.</div>';
        }

    } catch (err) {
        console.error("Load Error:", err);
        showToast(`??ë¡œë“œ ?¤íŒ¨: ${err.message}`);
    } finally {
        toggleLoading(false);
    }
}

// ?‰ê·  ê³„ì‚° ?¨ìˆ˜
function calculateAverages(records) {
    if (records.length === 0) return {};

    const sums = {
        'ë¬¸ë²•_?ìˆ˜': 0, '?‘ë¬¸_?ìˆ˜': 0, '?…í•´_?ìˆ˜': 0, '?£ê¸°_?ìˆ˜': 0, '?´íœ˜_?ìˆ˜': 0, 'ì´ì ': 0
    };

    // ? íš¨ ?ˆì½”????ê³„ì‚° (ê°??ì—­ë³„ë¡œ ?‘ì‹œ?ê? ?¤ë? ???ˆìœ¼???¬ê¸°???„ì²´ ê¸°ì?)
    let count = 0;
    const scoreMap = {
        'ë¬¸ë²•_?ìˆ˜': ['ë¬¸ë²•_?ìˆ˜', 'grammarScore', 'Grammar'],
        '?‘ë¬¸_?ìˆ˜': ['?‘ë¬¸_?ìˆ˜', 'writingScore', 'Writing'],
        '?…í•´_?ìˆ˜': ['?…í•´_?ìˆ˜', 'readingScore', 'Reading'],
        '?£ê¸°_?ìˆ˜': ['?£ê¸°_?ìˆ˜', 'listeningScore', 'Listening'],
        '?´íœ˜_?ìˆ˜': ['?´íœ˜_?ìˆ˜', 'vocabScore', 'Vocab', 'Vocabulary'],
        'ì´ì ': ['ì´ì ', 'totalScore', 'Total']
    };

    const getScore = (rec, key) => {
        const keys = scoreMap[key] || [key];
        for (const k of keys) {
            if (rec[k] !== undefined && rec[k] !== "") return parseInt(rec[k]);
        }
        return 0;
    };

    records.forEach(record => {
        // ê°„ë‹¨??? íš¨??ê²€??(ì´ì  ê´€???¤ê? ?ˆëŠ” ê²½ìš°ë§?
        if (getScore(record, 'ì´ì ') > 0 || record['ì´ì '] !== undefined || record['totalScore'] !== undefined) {
            sums['ë¬¸ë²•_?ìˆ˜'] += getScore(record, 'ë¬¸ë²•_?ìˆ˜');
            sums['?‘ë¬¸_?ìˆ˜'] += getScore(record, '?‘ë¬¸_?ìˆ˜');
            sums['?…í•´_?ìˆ˜'] += getScore(record, '?…í•´_?ìˆ˜');
            sums['?£ê¸°_?ìˆ˜'] += getScore(record, '?£ê¸°_?ìˆ˜');
            sums['?´íœ˜_?ìˆ˜'] += getScore(record, '?´íœ˜_?ìˆ˜');
            sums['ì´ì '] += getScore(record, 'ì´ì ');
            count++;
        }
    });

    if (count === 0) return sums;

    return {
        'ë¬¸ë²•_?ìˆ˜': sums['ë¬¸ë²•_?ìˆ˜'] / count,
        '?‘ë¬¸_?ìˆ˜': sums['?‘ë¬¸_?ìˆ˜'] / count,
        '?…í•´_?ìˆ˜': sums['?…í•´_?ìˆ˜'] / count,
        '?£ê¸°_?ìˆ˜': sums['?£ê¸°_?ìˆ˜'] / count,
        '?´íœ˜_?ìˆ˜': sums['?´íœ˜_?ìˆ˜'] / count,
        'ì´ì ': sums['ì´ì '] / count
    };
}

// AI ?ì—­ë³?ì½”ë©˜???ì„±
async function generateSectionComments(record, averages, activeSections) {
    const comments = {};
    const secMap = {
        'Grammar': 'grammarScore', 'Writing': 'writingScore',
        'Reading': 'readingScore', 'Listening': 'listeningScore', 'Vocabulary': 'vocabScore'
    };
    const maxMap = {
        'Grammar': 'grammarMax', 'Writing': 'writingMax',
        'Reading': 'readingMax', 'Listening': 'listeningMax', 'Vocabulary': 'vocabMax'
    };

    // ë¬¸í•­ë³??¸ë? ?°ì´???Œì‹±
    let questionScores = [];
    try {
        const qRaw = record['ë¬¸í•­ë³„ìƒ??JSON)'] || record.questionScores || '[]';
        questionScores = typeof qRaw === 'string' ? JSON.parse(qRaw) : (Array.isArray(qRaw) ? qRaw : []);
    } catch(e) { questionScores = []; }
    const catQs = globalConfig.questions || [];

    for (let section of activeSections) {
        const studentScore = parseFloat(record[section + '_?ìˆ˜'] || record[secMap[section]] || 0);
        const avgScore    = parseFloat(averages[section + '_?ìˆ˜'] || averages[secMap[section]] || 0);
        const maxScore    = parseFloat(record[section + '_ë§Œì '] || record[maxMap[section]] || averages[maxMap[section]] || 0);

        // ?±ì·¨?ˆë²¨ ê³„ì‚°
        const rate = maxScore > 0 ? (studentScore / maxScore * 100) : 0;
        const level = rate >= 90 ? '?°ìˆ˜' : rate >= 70 ? 'ë³´í†µ' : 'ë¶€ì§?;

        // ?¸ë??ì—­(subType) + ?•ì˜¤??ë¬¸í•­ ?Œì‹±
        let subTypeInfo = '';
        let wrongInfo = '';
        if (questionScores.length > 0) {
            const secItems = questionScores.filter(q => {
                const cq = catQs.find(cq => String(cq.id) === String(q.id));
                return cq?.section === section;
            });
            if (secItems.length > 0) {
                const subMap = {};
                const wrongItems = [];
                secItems.forEach(q => {
                    const cq = catQs.find(cq => String(cq.id) === String(q.id));
                    const sub = cq?.subType || 'ê¸°í?';
                    if (!subMap[sub]) subMap[sub] = { score: 0, max: 0 };
                    subMap[sub].score += parseFloat(q.score || 0);
                    subMap[sub].max   += parseFloat(q.maxScore || 0);
                    // ?¤ë‹µ ë¬¸í•­ ?˜ì§‘
                    const isWrong = (q.correct === false || q.correct === 'X') ||
                                    (parseFloat(q.score || 0) < parseFloat(q.maxScore || 0));
                    if (isWrong) wrongItems.push(`${q.no || '?'}ë²?${sub})`);
                });
                const subLines = Object.entries(subMap)
                    .map(([sub, v]) => `  - ${sub}: ${v.score}/${v.max}??)
                    .join('\n');
                subTypeInfo = `\n?¸ë? ?ì—­ë³??ìˆ˜:\n${subLines}`;
                if (wrongItems.length > 0)
                    wrongInfo = `\n?¤ë‹µ/ê°ì  ë¬¸í•­: ${wrongItems.join(', ')}`;
            }
        }

        const gradeTone = getGradeTone(record.grade || record['?™ë…„']);

        const prompt = `${gradeTone}

?„ë˜ ?™ìƒ??${section} ?ì—­ ?±ì  ?°ì´?°ë? ë°”íƒ•?¼ë¡œ ?¼ë“œë°±ì„ ?‘ì„±?´ì£¼?¸ìš”.

[?±ì  ?°ì´??
ê°œì¸ ?ìˆ˜: ${studentScore}??/ ?ì—­ ë§Œì : ${maxScore > 0 ? maxScore + '?? : '?•ë³´ ?†ìŒ'} / ë°??‰ê· : ${avgScore.toFixed(1)}??/ ?±ì·¨?ˆë²¨: ${level}(${rate.toFixed(0)}%)${subTypeInfo}${wrongInfo}

[?‘ì„± ê·œì¹™]
1) ?˜í•œ ??(2ë¬¸ì¥)
2) ë¯¸í¡?????ëŠ” ?½ì  (1ë¬¸ì¥)
3) êµ¬ì²´???™ìŠµ ë°©í–¥ ?œì‹œ (1ë¬¸ì¥)

?¤ì œ ?ìˆ˜?€ ë§Œì ??ë°˜ë“œ???¸ê¸‰?˜ì„¸?? ?™ì›ëª? êµì¬ëª? ë¸Œëœ?œëª…?€ ?ˆë? ?¸ê¸‰?˜ì? ë§ˆì„¸?? ëª¨ë“  ?µë??€ ?œìˆ˜ ?œêµ­?´ë°”?•ìœ¼ë¡??˜ì„¸??`;

        comments[section] = await callGeminiAPI(prompt);
    }
    return comments;
}


// Gemini API ?¸ì¶œ
// Gemini API ?¸ì¶œ (Fixed Scope & Backend Proxy)
async function callGeminiAPI(prompt, silent = false) {
    if (!globalConfig.geminiKey) {
        if (!silent) showToast("? ï¸ ?¤ì •?ì„œ Gemini API Keyë¥?ë¨¼ì? ?±ë¡?´ì£¼?¸ìš”.");
        return "AI ?¤ì • ?„ìš”";
    }

    // [Proxy] Call Backend Instead of Direct API
    // This avoids CORS/404 issues by using Google's servers
    try {
        if (!silent) toggleLoading(true);

        const payload = {
            type: 'CALL_GEMINI',
            key: globalConfig.geminiKey,
            prompt: prompt
        };

        const result = await sendReliableRequest(payload);

        if (!silent) toggleLoading(false);

        if (result.status === "Success" && result.data) {
            const data = result.data;
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.warn("Gemini API (Proxy) returned no candidates:", data);
                return "AI ë¶„ì„???ì„±?????†ìŠµ?ˆë‹¤. (?´ìš©???ˆì „ ?•ì±…???˜í•´ ?„í„°ë§ë¨)";
            }
        } else {
            console.error("Gemini Proxy Error:", result.message);
            return "AI ?œë¹„???¤ë¥˜: " + (result.message || "Unknown Proxy Error");
        }

    } catch (e) {
        if (!silent) toggleLoading(false);
        console.error("Gemini Call Exception:", e);
        return "AI ?œë¹„???°ê²° ?¤íŒ¨";
    }
}

// ?±ì ???Œë”ë§?(Chart.js ?¬í•¨)
function renderReportCard(record, averages, sectionComments, overallComment, activeSections) {
    const display = document.getElementById('report-display');
    if (!display) return;

    setCanvasId('05-1'); // ê°œì¸ ?±ì ??ìº”ë²„??

    function getVal(obj, keys) {
        for (const k of keys) { if (obj[k] !== undefined && obj[k] !== '') return obj[k]; }
        return '';
    }

    const sName  = getVal(record, ['?´ë¦„','name','studentName']);
    const sGrade = getVal(record, ['?™ë…„','grade']);
    const sDateRaw = getVal(record, ['?‘ì‹œ??,'testDate','date']);
    const sDate  = sDateRaw ? String(sDateRaw).split('T')[0] : '';
    const sTotal = parseFloat(getVal(record, ['ì´ì ','totalScore','total']) || 0);
    const sMax   = parseFloat(getVal(record, ['ë§Œì ','maxScore','max']) || 100);
    let sRate    = getVal(record, ['?•ë‹µë¥?%)','?•ë‹µë¥?,'rate']);
    if (!sRate && sMax) sRate = ((sTotal / sMax) * 100).toFixed(1);

    const secMap = { Grammar:'grammarScore', Writing:'writingScore', Reading:'readingScore', Listening:'listeningScore', Vocabulary:'vocabScore' };
    const maxMap  = { Grammar:'grammarMax',   Writing:'writingMax',   Reading:'readingMax',   Listening:'listeningMax',  Vocabulary:'vocabMax'   };

    display.innerHTML = `
    <div class="card space-y-8 animate-fade-in mt-5">

        <!-- ?™ìƒ ê¸°ë³¸ ?•ë³´ -->
        <div class="border-b pb-6 flex items-start justify-between">
            <div>
                <h3 style="font-size:24px;font-weight:900;color:#013976;">${sName} ?™ìƒ ?±ì ??/h3>
                <p class="fs-18 text-slate-600 mt-2">${sGrade}?™ë…„ | ?‘ì‹œ?? ${sDate}</p>
            </div>
            <!-- ?°ìƒ?? ?±ë¡ê¶Œì¥ ?™ê¸‰ + ì´ì  -->
            <div class="flex items-stretch gap-6">

                <!-- ê¶Œì¥?™ê¸‰ (?µí•© ë°•ìŠ¤: ë°°ê²½??êµ¬ë¶„) -->
                <div style="border:2px solid #013976;border-radius:1rem;height:65px;min-width:160px;display:flex;align-items:stretch;overflow:hidden;">
                    <!-- ?¼ë²¨ (?¤ì´ë¹?ë°°ê²½) -->
                    <div style="background:#013976;color:white;font-size:15px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 14px;white-space:nowrap;letter-spacing:0.5px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                        ê¶Œì¥<br>?™ê¸‰
                    </div>
                    <!-- ?œë¡­?¤ìš´ (??ë°°ê²½) -->
                    <select id="report-student-class"
                        style="border:none;outline:none;font-size:20px;font-weight:900;color:#013976;background:white;text-align:center;cursor:pointer;-webkit-appearance:none;min-width:80px;padding:0 12px;">
                        <option value="" style="font-size:16px;">? íƒ</option>
                        ${(getClassesForGrade(record['?™ë…„']||record.grade||'') || []).map(c =>
                            `<option value="${c}" style="font-size:16px;" ${(record.studentClass||record['?±ë¡?™ê¸‰']||'')===c?'selected':''}>${c}</option>`
                        ).join('')}
                    </select>
                </div>

                <!-- ?¸ë¡œ êµ¬ë¶„??-->
                <div style="width:1px;background:#cbd5e1;align-self:stretch;margin:0 2px;"></div>

                <!-- ì´ì  -->
                <div style="background:linear-gradient(135deg,#013976 0%,#1a5276 100%);border-radius:1rem;width:160px;height:65px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;" class="shadow-lg">
                    <div style="font-size:24px;font-weight:900;line-height:1;">${sTotal}</div>
                    <div style="font-size:14px;opacity:0.75;margin-top:5px;">/ ${sMax}??(${sRate}%)</div>
                </div>
            </div>
        </div>

        <!-- 1. ì´ì  ë§‰ë?ê·¸ë˜??-->
        <div>
            <h4 style="font-size:18px;font-weight:900;color:#013976;margin-bottom:1rem;">?“Š ì´ì  ë¹„êµ</h4>
            <canvas id="chart-total" style="max-height:240px;"></canvas>
        </div>

        <!-- 2. ?ì—­ë³?ë§‰ë?ê·¸ë˜??-->
        <div>
            <h4 style="font-size:18px;font-weight:900;color:#013976;margin-bottom:1rem;">?“Š ?ì—­ë³??ìˆ˜ ë¹„êµ</h4>
            <canvas id="chart-sections-bar" style="max-height:320px;"></canvas>
        </div>

        <!-- 3. ?ˆì´??ì°¨íŠ¸ -->
        <div>
            <h4 style="font-size:18px;font-weight:900;color:#013976;margin-bottom:1rem;">?•¸ ?ì—­ë³?ê· í˜•??/h4>
            <canvas id="chart-radar" style="max-height:380px;"></canvas>
        </div>

        <!-- 4. ?ì—­ë³?ì½”ë©˜??-->
        <div id="qdetail-checkbox-row" class="flex items-center gap-3 py-3 px-4 bg-slate-100 rounded-2xl border">
            <input type="checkbox" id="chk-qdetail" onchange="toggleAllQuestionDetail(this.checked)"
                class="w-5 h-5 cursor-pointer accent-[#013976]">
            <label for="chk-qdetail" class="cursor-pointer font-bold text-[#013976] fs-16 select-none">ë¬¸í•­ë³??ì„¸ ë³´ê¸°</label>
        </div>
        <div class="space-y-4" id="sections-container">
            ${activeSections.map(section => {
                const sScore = parseFloat(record[section+'_?ìˆ˜'] || record[secMap[section]] || 0);
                const sMaxV  = parseFloat(record[section+'_ë§Œì '] || record[maxMap[section]] || averages[maxMap[section]] || 0);
                const aScore = parseFloat(averages[section+'_?ìˆ˜'] || averages[secMap[section]] || 0);
                const comment = sectionComments?.[section];
                return `<div class="bg-slate-50 rounded-2xl border overflow-hidden">
                    <div class="px-6 py-4 flex items-center justify-between">
                        <div class="flex items-center gap-3 flex-wrap">
                            <h5 class="font-black text-[#013976] fs-18">${section} ?ì—­</h5>
                            <span class="text-slate-500" style="font-size:15px;">ê°œì¸: ${sScore}??| ?‰ê· : ${aScore.toFixed(1)}??{sMaxV>0?' | ë§Œì : '+sMaxV+'??:''}</span>
                        </div>
                        <button onclick="regenerateSectionComment('${section}')" class="no-print text-xl px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all" title="???ì—­ ì½”ë©˜???¬ìƒ??>?”„</button>
                    </div>
                    ${comment
                        ? `<div class="px-6 pb-4 border-t border-slate-200 pt-3"><p class="fs-15 text-slate-600 leading-relaxed">${comment.split('\n').map(l=>l.trim()).filter(l=>l).join('<br>')}</p></div>`
                        : `<div class="px-6 pb-4 border-t border-slate-200 pt-3"><p class="text-slate-400 fs-14 italic text-center py-2">ë¶„ì„ ?€ê¸?ì¤?..</p></div>`
                    }
                    <div id="qdetail-${section}" class="hidden px-6 pb-6 border-t border-slate-100">
                        <p class="text-slate-400 fs-14 text-center py-4">ë¡œë”© ì¤?..</p>
                    </div>
                </div>`;
            }).join('')}
        </div>

        <!-- 5. ì¢…í•©ë¶„ì„ ì½”ë©˜??-->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-3xl border-2 border-blue-200">
            <h4 class="ys-label text-blue-700 mb-3">?¤– ì¢…í•©ë¶„ì„ ì½”ë©˜??/h4>
            ${overallComment
                ? `<p class="text-slate-700 leading-relaxed whitespace-pre-wrap fs-15">${overallComment}</p>`
                : `<div class="text-center py-4">
                    <p class="text-slate-500 mb-4 fs-15">AI ?¬ì¸µ ë¶„ì„???µí•´ ?™ìƒ??ê°•ì ê³??½ì ???Œì•…?´ë³´?¸ìš”.</p>
                    <button onclick="triggerAIAnalysis()" class="btn-ys !bg-[#013976] !text-white !py-3 !px-8 shadow-lg hover:scale-105 transition-all fs-16 font-bold flex items-center gap-2 mx-auto">??AI ë¶„ì„ ?ì„±?˜ê¸°</button>
                  </div>`
            }
        </div>

        <!-- Logo -->
        <div class="mt-8 border-t pt-8 text-center">
            <img src="${globalConfig.logoUrl||''}" alt="Logo" class="inline-block max-h-16 object-contain" onerror="this.style.display='none'">
        </div>
    </div>`;

    // ì°¨íŠ¸ ?Œë”ë§?
    setTimeout(() => {
        renderTotalChart(record, averages, sTotal, sMax);
        renderSectionsBarChart(record, averages, activeSections, secMap, maxMap);
        renderRadarChart(record, averages, activeSections, secMap, maxMap);
    }, 100);
}

// [New] ?¬ì±„????ê¸°ì¡´ ?™ìƒ ?µì•ˆ????ì±„ì  ë¡œì§?¼ë¡œ ?¬ê³„??
async function regradeStudent(silent = false) {
    if (!window.currentReportData) { if (!silent) showToast('? ï¸ ?±ì ?œë? ë¨¼ì? ë¡œë“œ?´ì£¼?¸ìš”.'); return; }
    if (!silent && !confirm('???™ìƒ???µì•ˆ????ì±„ì  ë¡œì§(ê´€?€??ë§¤ì¹­ + AI)?¼ë¡œ ?¬ì±„?í•©?ˆë‹¤.\nê³„ì†?˜ì‹œê² ìŠµ?ˆê¹Œ?')) return;

    const { record } = window.currentReportData;
    const categoryId = document.getElementById('report-category')?.value;
    const category = globalConfig.categories.find(c => c.id === categoryId);
    if (!category) { if (!silent) showToast('??ì¹´í…Œê³ ë¦¬ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.'); return; }

    toggleLoading(true);
    try {
        // 1. ê¸°ì¡´ questionScores ?Œì‹±
        const qs = JSON.parse(record.questionScores || record['ë¬¸í•­ë³„ìƒ??JSON)'] || '[]');
        if (qs.length === 0) { if (!silent) showToast('? ï¸ ë¬¸í•­ë³??°ì´?°ê? ?†ì–´ ?¬ì±„??ë¶ˆê??©ë‹ˆ??'); return; }

        // 2. ë¬¸í•­ ë±…í¬ ë¡œë“œ (section/difficulty/modelAnswer ì°¸ì¡°??
        const catQs = (globalConfig.questions || []).filter(q => String(q.catId) === String(categoryId));

        // 3. ??ë¡œì§?¼ë¡œ ?¬ì±„??
        const normalize = s => s.toLowerCase().replace(/[\s,.\-_'"!?;:()`\u2018\u2019\u201C\u201D]/g, '').trim();
        const sections = { Grammar:{s:0,m:0}, Writing:{s:0,m:0}, Reading:{s:0,m:0}, Listening:{s:0,m:0}, Vocabulary:{s:0,m:0} };
        const difficulties = { 'ìµœìƒ':{s:0,m:0}, '??:{s:0,m:0}, 'ì¤?:{s:0,m:0}, '??:{s:0,m:0}, 'ê¸°ì´ˆ':{s:0,m:0} };
        let totalScore = 0, maxScore = 0;

        for (const q of qs) {
            const maxQ = parseInt(q.maxScore) || 0;
            const studentAns = String(q.studentAnswer || '').trim();
            const correctAns = String(q.correctAnswer || '').trim();
            const bankQ = catQs.find(cq => String(cq.no) === String(q.no));
            let earnedScore = 0;
            let isCorrect = false;

            if (q.type === 'ê°ê???) {
                isCorrect = normalize(studentAns) === normalize(correctAns);
                earnedScore = isCorrect ? maxQ : 0;
            } else {
                if (!studentAns) {
                    earnedScore = 0;
                } else if (correctAns) {
                    const acceptable = correctAns.split(',').map(a => normalize(a));
                    isCorrect = acceptable.includes(normalize(studentAns));
                    earnedScore = isCorrect ? maxQ : 0;
                }
                if (!isCorrect && studentAns && globalConfig.geminiKey) {
                    try {
                        const aiQ = bankQ || { questionTitle: q.no + 'ë²?, questionType: q.type, section: q.section || '', answer: correctAns, modelAnswer: '', score: maxQ };
                        const aiResult = await gradeWithAI(aiQ, studentAns);
                        if (aiResult && aiResult.score !== undefined) {
                            earnedScore = Math.min(Math.max(0, Math.round(aiResult.score)), maxQ);
                            isCorrect = earnedScore >= maxQ;
                            console.log(`?”„ ?¬ì±„??[ë¬¸í•­ ${q.no}]: ${earnedScore}/${maxQ} (${aiResult.feedback})`);
                        }
                    } catch (e) { console.warn(`? ï¸ AI ?¬ì±„???¤íŒ¨ [${q.no}]:`, e.message); }
                }
            }

            q.score = earnedScore;
            q.correct = isCorrect;
            q._gradingV2 = true; // ?¬ì±„???„ë£Œ ?Œë˜ê·?
            totalScore += earnedScore;
            maxScore += maxQ;

            const sec = q.section || bankQ?.section || 'Reading';
            const diff = q.difficulty || bankQ?.difficulty || 'ì¤?;
            if (sections[sec]) { sections[sec].s += earnedScore; sections[sec].m += maxQ; }
            if (difficulties[diff]) { difficulties[diff].s += earnedScore; difficulties[diff].m += maxQ; }
        }

        // 4. ?œë²„ ?…ë°?´íŠ¸ ?€??
        const folderId = extractFolderId(category.targetFolderUrl);
        const payload = {
            type: 'STUDENT_SAVE',
            categoryId: categoryId,
            categoryName: category.name,
            parentFolderId: folderId,
            testDate: record['? ì§œ'] || record.testDate || '',
            studentId: record['?™ìƒID'] || record.studentId || '',
            studentName: record['?´ë¦„'] || record.studentName || '',
            grade: record['?™ë…„'] || record.grade || '',
            questionScores: JSON.stringify(qs),
            grammarScore: sections.Grammar.s, grammarMax: sections.Grammar.m,
            writingScore: sections.Writing.s, writingMax: sections.Writing.m,
            readingScore: sections.Reading.s, readingMax: sections.Reading.m,
            listeningScore: sections.Listening.s, listeningMax: sections.Listening.m,
            vocabScore: sections.Vocabulary.s, vocabMax: sections.Vocabulary.m,
            difficulty_highest: difficulties['ìµœìƒ'].s, difficulty_highest_max: difficulties['ìµœìƒ'].m,
            difficulty_high: difficulties['??].s, difficulty_high_max: difficulties['??].m,
            difficulty_mid: difficulties['ì¤?].s, difficulty_mid_max: difficulties['ì¤?].m,
            difficulty_low: difficulties['??].s, difficulty_low_max: difficulties['??].m,
            difficulty_basic: difficulties['ê¸°ì´ˆ'].s, difficulty_basic_max: difficulties['ê¸°ì´ˆ'].m,
            totalScore: totalScore,
            maxScore: maxScore
        };

        await sendReliableRequest(payload);
        showToast(`???¬ì±„???„ë£Œ! ì´ì : ${totalScore}/${maxScore}`);

        // 5. ?±ì ???ˆë¡œê³ ì¹¨ (?´ë²ˆ??_gradingV2 ?Œë˜ê·¸ê? ?ˆìœ¼ë¯€ë¡??¬ì±„??ê±´ë„ˆ?€)
        await loadStudentReport();

    } catch (e) {
        console.error('?¬ì±„???¤ë¥˜:', e);
        showToast('???¬ì±„???¤íŒ¨: ' + e.message);
    } finally {
        toggleLoading(false);
    }
}

function toggleAllQuestionDetail(checked) {
    const record = window.currentReportData?.record || {};
    const isSection = record.inputMode === 'section';

    if (isSection) {
        // section ëª¨ë“œ: ì²´í¬ ?´ì œ ???ˆë‚´ ? ìŠ¤??
        document.getElementById('chk-qdetail').checked = false;
        showToast('? ï¸ ?ì—­ë³??ìˆ˜ë§??…ë ¥???™ìƒ?¼ë¡œ, ë¬¸í•­ë³??•ë³´ê°€ ?…ë ¥?˜ì? ?Šì•„ ë¶ˆê??©ë‹ˆ??');
        return;
    }

    const allQdetail = document.querySelectorAll('[id^="qdetail-"]');
    if (!checked) {
        allQdetail.forEach(el => el.classList.add('hidden'));
        return;
    }

    // ?¼ì¹˜ê¸? ê°??¹ì…˜ ?Œë”ë§?
    try {
        const qs = JSON.parse(record['ë¬¸í•­ë³„ìƒ??JSON)'] || record.questionScores || '[]');
        const catQs = globalConfig.questions || [];

        const mark = (q) => {
            if (q.correct === true  || q.correct === 'O') return '<span class="text-green-600 font-black">O</span>';
            if (q.correct === false || q.correct === 'X') return '<span class="text-red-500 font-black">X</span>';
            if (q.score > 0 && q.maxScore > 0 && q.score === q.maxScore) return '<span class="text-green-600 font-black">O</span>';
            if (q.score === 0 && q.maxScore > 0) return '<span class="text-red-500 font-black">X</span>';
            return '<span class="text-slate-400">??/span>';
        };

        allQdetail.forEach(el => {
            const section = el.id.replace('qdetail-', '');
            el.classList.remove('hidden');
            // [Fix] questionScores ?ì²´??section ?„ë“œ ?°ì„  ?¬ìš©, ?†ìœ¼ë©?no(ë¬¸í•­ë²ˆí˜¸)ë¡?catQs ë§¤ì¹­
            // (GET_FULL_DBê°€ ë§¤ë²ˆ ?œë¤ IDë¥??ì„±?˜ë?ë¡? id ë§¤ì¹­?€ ë¶ˆê?????no ë§¤ì¹­ ?¬ìš©)
            const secItems = qs.filter(q => {
                if (q.section) return q.section === section;
                const found = catQs.find(cq => String(cq.no) === String(q.no));
                return found?.section === section;
            });
            if (secItems.length === 0) { el.innerHTML = '<p class="text-slate-400 fs-14 text-center py-4">ë¬¸í•­ ?•ë³´ ?†ìŒ</p>'; return; }
            // [Redesign] ê°€ë¡?ê·¸ë¦¬???ˆì´?„ì›ƒ (10ê°œì”© ë¬¶ìŒ)
            let gridHtml = '';
            for (let i = 0; i < secItems.length; i += 10) {
                const chunk = secItems.slice(i, i + 10);
                const cols = chunk.length;
                gridHtml += `<table class="w-full fs-14 mt-3 border-collapse" style="table-layout:fixed;">
                    <tr class="bg-[#013976] text-white">${chunk.map(q =>
                        `<th class="py-1.5 px-1 text-center font-bold border border-[#013976]" style="width:10%">${q.no||'-'}</th>`
                    ).join('')}${'<th class="border-0" style="width:10%"></th>'.repeat(10 - cols)}</tr>
                    <tr class="bg-slate-50">${chunk.map(q =>
                        `<td class="py-1 px-1 text-center text-slate-500 border border-slate-200 text-[14px]">${q.maxScore||0}??/td>`
                    ).join('')}${'<td class="border-0"></td>'.repeat(10 - cols)}</tr>
                    <tr class="bg-white">${chunk.map(q => {
                        const cq = catQs.find(cq => String(cq.no) === String(q.no));
                        const diff = q.difficulty || cq?.difficulty || '-';
                        const diffColor = {'ìµœìƒ':'text-red-600','??:'text-orange-500','ì¤?:'text-blue-500','??:'text-green-500','ê¸°ì´ˆ':'text-slate-400'}[diff] || 'text-slate-500';
                        return `<td class="py-1 px-1 text-center border border-slate-200 text-[14px] ${diffColor}">${diff}</td>`;
                    }).join('')}${'<td class="border-0"></td>'.repeat(10 - cols)}</tr>
                    <tr class="bg-slate-50">${chunk.map(q =>
                        `<td class="py-1 px-1 text-center font-bold border border-slate-200 text-[14px]">${q.score||0}??/td>`
                    ).join('')}${'<td class="border-0"></td>'.repeat(10 - cols)}</tr>
                    <tr class="bg-white">${chunk.map(q =>
                        `<td class="py-1.5 px-1 text-center font-black border border-slate-200 text-[15px]">${mark(q)}</td>`
                    ).join('')}${'<td class="border-0"></td>'.repeat(10 - cols)}</tr>
                </table>`;
            }
            // ???¼ë²¨ ì¶”ê?
            el.innerHTML = `<div class="mt-3 space-y-1">
                ${gridHtml}
            </div>`;
        });
    } catch(e) { showToast('??ë¬¸í•­ ?°ì´???¤ë¥˜: ' + e.message); }
}

function renderTotalChart(record, averages, sTotal, sMax) {
    const ctx = document.getElementById('chart-total');
    if (!ctx) return;
    if (ctx._chartInstance) ctx._chartInstance.destroy();
    const avgTotal = averages['ì´ì '] || 0;
    const DL = window.ChartDataLabels;
    if (DL && !Chart._dlRegistered) { Chart.register(DL); Chart._dlRegistered = true; }
    ctx._chartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        plugins: DL ? [DL] : [],
        data: {
            labels: ['ì´ì '],
            datasets: [
                { label: 'ê°œì¸ ?ìˆ˜', data: [sTotal], backgroundColor: '#e74c3c', borderRadius: 8 },
                { label: '?‰ê· ',      data: [avgTotal], backgroundColor: '#94a3b8', borderRadius: 8 },
                { label: 'ë§Œì ',      data: [sMax],     backgroundColor: '#013976', borderRadius: 8 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { beginAtZero:true, max:sMax, ticks:{font:{size:16}, callback: v => Number.isInteger(v) ? v : parseFloat(v).toFixed(1)} }, x:{ticks:{font:{size:16}}} },
            plugins: {
                legend: { position: 'right', labels:{font:{size:16}} },
                tooltip: { bodyFont:{size:16}, titleFont:{size:16}, callbacks: { label: ctx => ' ' + ctx.dataset.label + ': ' + parseFloat(ctx.raw).toFixed(1) } },
                datalabels: DL ? {
                    anchor: 'center', align: 'center',
                    font: { size: 16, weight: 'bold' },
                    color: 'white',
                    formatter: (v) => v > 0 ? parseFloat(v).toFixed(1) : ''
                } : false
            }
        }
    });
}

// ?ì—­ë³?ë§‰ë? (ê·¸ë£¹)
function renderSectionsBarChart(record, averages, activeSections, secMap, maxMap) {
    const ctx = document.getElementById('chart-sections-bar');
    if (!ctx) return;
    if (ctx._chartInstance) ctx._chartInstance.destroy();
    const DL = window.ChartDataLabels;
    const labels = activeSections.map(s => s);
    const personal = activeSections.map(s => parseFloat(record[s+'_?ìˆ˜'] || record[secMap[s]] || 0));
    const avg      = activeSections.map(s => parseFloat(averages[s+'_?ìˆ˜'] || averages[secMap[s]] || 0));
    const maxV     = activeSections.map(s => parseFloat(record[s+'_ë§Œì '] || record[maxMap[s]] || averages[maxMap[s]] || 0));
    ctx._chartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        plugins: DL ? [DL] : [],
        data: {
            labels,
            datasets: [
                { label: 'ê°œì¸ ?ìˆ˜', data: personal, backgroundColor: '#e74c3c', borderRadius: 6 },
                { label: '?‰ê· ',      data: avg.map(v => +parseFloat(v).toFixed(1)), backgroundColor: '#94a3b8', borderRadius: 6 },
                { label: 'ë§Œì ',      data: maxV,     backgroundColor: '#013976', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y:{beginAtZero:true, ticks:{font:{size:20}, callback: v => Number.isInteger(v) ? v : parseFloat(v).toFixed(1)}}, x:{ticks:{font:{size:20}}} },
            plugins: {
                legend: { position: 'right', labels:{font:{size:20}} },
                tooltip: { bodyFont:{size:20}, titleFont:{size:20}, callbacks: { label: ctx => ' ' + ctx.dataset.label + ': ' + parseFloat(ctx.raw).toFixed(1) } },
                datalabels: DL ? {
                    anchor: 'center', align: 'center',
                    font: { size:20, weight: 'bold' },
                    color: 'white',
                    formatter: (v) => v > 0 ? parseFloat(v).toFixed(1) : ''
                } : false
            }
        }
    });
}

// ?¸ì‡„ ?¨ìˆ˜ ??canvasë¥??´ë?ì§€ë¡?ë³€??????ì°?ì¶œë ¥
function printReport() {
    const catVal = document.getElementById('report-category')?.value;
    const stuVal = document.getElementById('report-student')?.value;
    if (!catVal || !stuVal) {
        showToast('? ï¸ ?œí—˜ì§€?€ ?™ìƒ??ë¨¼ì? ? íƒ?´ì£¼?¸ìš”.');
        return;
    }

    // ?±ë¡?™ê¸‰ ?„ìˆ˜ ì²´í¬
    const clsEl  = document.getElementById('report-student-class');
    const clsVal = clsEl?.value?.trim() || '';
    if (!clsVal) {
        showToast('? ï¸ ?±ë¡?™ê¸‰??? íƒ?´ì•¼ ì¶œë ¥?????ˆìŠµ?ˆë‹¤.');
        clsEl?.focus();
        return;
    }

    // [Fix] AI ì¢…í•© ë¶„ì„ ì½”ë©˜?¸ê? ?†ìœ¼ë©?ê²½ê³  ?ì—…
    const aiCommentEl = document.getElementById('report-display')?.querySelector('[id^="ai-summary"], [id^="ai-comment"]');
    const aiSectionTexts = Array.from(document.getElementById('report-display')?.querySelectorAll('p') || []).filter(p => p.textContent.includes('ë¶„ì„ ?€ê¸?ì¤?) || p.textContent.includes('ë¡œë”© ì¤?));
    if (aiSectionTexts.length > 0) {
        if (!confirm('? ï¸ AI ë¶„ì„ ì½”ë©˜?¸ê? ?„ì§ ?ì„±?˜ì? ?Šì•˜?µë‹ˆ??\n\nì½”ë©˜???†ì´ ?¸ì‡„?˜ì‹œê² ìŠµ?ˆê¹Œ?\n("ì·¨ì†Œ"ë¥??ŒëŸ¬ ì½”ë©˜?¸ë? ë¨¼ì? ?ì„±?˜ì„¸??')) {
            return;
        }
    }

    const display = document.getElementById('report-display');
    if (!display) return;

    // 1. ?„ì¬ ?˜ì´ì§€??CSS ?˜ì§‘
    const styles = Array.from(document.styleSheets).map(ss => {
        try { return Array.from(ss.cssRules).map(r => r.cssText).join('\n'); }
        catch(e) { return ''; }
    }).join('\n');

    // 2. ëª¨ë“  chart canvasë¥?PNG ?´ë?ì§€ ?°ì´?°ë¡œ ë³€??(?µì‹¬ ?˜ì •)
    const canvasIds = ['chart-total', 'chart-sections-bar', 'chart-radar'];
    const imgDataMap = {};
    canvasIds.forEach(id => {
        const cvs = document.getElementById(id);
        if (cvs) {
            imgDataMap[id] = {
                dataUrl: cvs.toDataURL('image/png'),
                width: cvs.offsetWidth,
                height: cvs.offsetHeight
            };
        }
    });

    // 3. display ?´ë? HTML ?´ë¡  ??canvas ??img êµì²´
    const clone = display.cloneNode(true);
    canvasIds.forEach(id => {
        const canvasEl = clone.querySelector('#' + id);
        if (canvasEl && imgDataMap[id]) {
            const img = document.createElement('img');
            img.src = imgDataMap[id].dataUrl;
            img.style.width = imgDataMap[id].width + 'px';
            img.style.maxWidth = '100%';
            img.style.maxHeight = (canvasEl.style.maxHeight || '400px');
            img.style.objectFit = 'contain';
            canvasEl.parentNode.replaceChild(img, canvasEl);
        }
    });

    // 3b. ?¸ì‡„ ë¶ˆí•„???”ì†Œ ?œê±°
    // [Fix] ë¬¸í•­ë³??ì„¸ë³´ê¸°: ì²´í¬ë°•ìŠ¤ ?íƒœ???°ë¼ ?œì‹œ/?¨ê?
    const isDetailChecked = document.getElementById('chk-qdetail')?.checked || false;
    // [Fix] ì²´í¬ë°•ìŠ¤ ???„ì²´ë¥??•ì‹¤???œê±° (idë¡?ì§ì ‘ ì§€??
    const chkRow = clone.querySelector('#qdetail-checkbox-row');
    if (chkRow) chkRow.remove();
    clone.querySelectorAll('[id^="qdetail-"]').forEach(el => {
        if (isDetailChecked) {
            el.classList.remove('hidden');
            el.style.display = '';
        } else {
            el.remove(); // ì²´í¬ ???˜ì–´ ?ˆìœ¼ë©??„ì „ ?œê±°
        }
    });

    // [Fix] "ë¶„ì„ ?€ê¸?ì¤?..", "ë¡œë”© ì¤?.." ??ë¡œë”© ?íƒœ ?ìŠ¤???œê±°
    clone.querySelectorAll('p').forEach(p => {
        const txt = p.textContent.trim();
        if (txt === 'ë¶„ì„ ?€ê¸?ì¤?..' || txt === 'ë¡œë”© ì¤?..' || txt === 'ë¶„ì„ ì¤?..') {
            const parent = p.closest('div');
            if (parent) parent.remove();
            else p.remove();
        }
    });

    // 3b-2. ê¶Œì¥?™ê¸‰ <select> ???ìŠ¤??span?¼ë¡œ êµì²´ (select???´ë¡  ??JS ? íƒê°??Œì‹¤)
    const _clsSel = clone.querySelector('#report-student-class');
    if (_clsSel) {
        const _clsSpan = document.createElement('span');
        _clsSpan.style.cssText = 'font-size:20px;font-weight:900;color:#013976;background:white;display:inline-flex;align-items:center;justify-content:center;min-width:80px;padding:0 12px;height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact;';
        _clsSpan.textContent = clsVal || 'ë¯¸ì„ ??;
        _clsSel.parentNode.replaceChild(_clsSpan, _clsSel);
    }


    // 3c. AI ì¢…í•© ë¶„ì„ ?¹ì…˜ ?ì— ?˜ì´ì§€ ê°•ì œ ë¶„ë¦¬
    const aiHeader = Array.from(clone.querySelectorAll('h4')).find(h => h.textContent.includes('AI ì¢…í•©'));
    if (aiHeader) {
        const aiSection = aiHeader.closest('div[class]');
        if (aiSection) aiSection.style.cssText += ';page-break-before:always;break-before:page;';
    }

    // 3d. ê°?ì°¨íŠ¸ ì»¨í…Œ?´ë„ˆ ?˜ì´ì§€ ë¶„ë¦¬ ë°©ì?
    clone.querySelectorAll('canvas, img').forEach(el => {
        el.style.pageBreakInside = 'avoid';
        if (el.parentElement) el.parentElement.style.pageBreakInside = 'avoid';
    });

    // 3e. \ud1b5\uc9dc \ubc15\uc2a4 \uc778\ub77c\uc778 \uc2a4\ud0c0\uc77c \uac15\uc81c \uc801\uc6a9 (TailwindCSS \uc784\uc758\uac12 \uadf8\ub77c\ub370\uc774\uc158 \ud074\ub798\uc2a4\ub294 \ud31d\uc5c5\uc5d0\uc11c \ubbf8\uc801\uc6a9)
    const scoreBox = clone.querySelector('.text-right.text-white');
    if (scoreBox) {
        scoreBox.style.background = 'linear-gradient(135deg, #013976 0%, #1a5276 100%)';
        scoreBox.style.color = 'white';
        scoreBox.style.borderRadius = '1rem';
        scoreBox.style.padding = '1rem 1.5rem';
        scoreBox.querySelectorAll('*').forEach(el => {
            el.style.color = 'white';
            el.style.opacity = '1';
        });
    }

    // 4. ë°°ë„ˆ HTML (?°ì¸¡ ?˜ë‹¨ ê³ ì •, 50% ?¬ê¸°)
    const bannerHtml = globalConfig.banner
        ? `<div style="position:fixed;bottom:0;right:0;width:50%;z-index:9999;">
               <img src="${getSafeImageUrl(globalConfig.banner)}" alt="Report Banner"
                    style="width:100%;max-height:120px;object-fit:cover;object-position:center;display:block;">
           </div>`
        : '';

    // 5. ?ì—… ì°??´ê¸° ë°?ì¶œë ¥
    const win = window.open('', '_blank', 'width=900,height=1200');
    if (!win) { showToast('? ï¸ ?ì—…??ì°¨ë‹¨?˜ì—ˆ?µë‹ˆ?? ë¸Œë¼?°ì? ?ì—… ?ˆìš© ???¤ì‹œ ?œë„?´ì£¼?¸ìš”.'); return; }
    win.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>?±ì ???¸ì‡„</title>
<script>
(function(){
  const _f=a=>a[0]&&typeof a[0]==='string'&&a[0].includes('cdn.tailwindcss.com');
  const _w=console.warn;console.warn=function(...a){if(_f(a))return;_w.apply(console,a);};
  const _l=console.log;console.log=function(...a){if(_f(a))return;_l.apply(console,a);};
})();
<\/script>
<script src="https://cdn.tailwindcss.com"><\/script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap">
<style>
  /* Noto Sans KR via link tag above */
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { font-family: 'Noto Sans KR', sans-serif; background:#fff; margin:0; padding:24px 32px 160px; color:#1e293b; }
  img { max-width:100%; }
  .no-print { display:none !important; }
  @media print {
    @page { margin:12mm; }
    body { padding-bottom:140px; }
    .card, section, [class*='rounded'] { page-break-inside: avoid; }
    h4 { page-break-after: avoid; }
  }
  ${styles}
</style>
</head><body>
${clone.innerHTML}
${bannerHtml}
<script>
window.onload = function() { setTimeout(function(){ window.print(); }, 800); };
<\/script>
</body></html>`);
    win.document.close();
}

// ?ˆì´??ì°¨íŠ¸ ???•ë‹µë¥?%) ê¸°ì??¼ë¡œ ?•ê·œ??(ë§Œì  ?¤ë¥¸ ?ì—­ ê³µì • ë¹„êµ)
function renderRadarChart(record, averages, activeSections, secMap, maxMap) {
    const ctx = document.getElementById('chart-radar');
    if (!ctx || activeSections.length < 3) return;
    if (ctx._chartInstance) ctx._chartInstance.destroy();

    // ê°??ì—­ ë§Œì  êµ¬í•˜ê¸?(record ?°ì„ , ?†ìœ¼ë©?globalConfig.questions ?©ì‚°)
    const getSectionMax = (s) => {
        const fromRecord = parseFloat(record[s+'_ë§Œì '] || record[maxMap?.[s]] || 0);
        if (fromRecord > 0) return fromRecord;
        // globalConfig?ì„œ ?´ë‹¹ ?ì—­ ë¬¸í•­ ë°°ì  ?©ì‚°
        const catQs = globalConfig?.questions || [];
        return catQs.filter(q => q.section === s).reduce((sum, q) => sum + (parseInt(q.score)||0), 0) || 100;
    };

    const rawPersonal = activeSections.map(s => parseFloat(record[s+'_?ìˆ˜'] || record[secMap[s]] || 0));
    const rawAvg      = activeSections.map(s => parseFloat(averages[s+'_?ìˆ˜'] || averages[secMap[s]] || 0));
    const maxScores   = activeSections.map(s => getSectionMax(s));

    // ?•ë‹µë¥?%) ë³€??
    const pctPersonal = rawPersonal.map((v, i) => maxScores[i] > 0 ? +((v / maxScores[i]) * 100).toFixed(1) : 0);
    const pctAvg      = rawAvg.map((v, i)      => maxScores[i] > 0 ? +((v / maxScores[i]) * 100).toFixed(1) : 0);

    ctx._chartInstance = new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: activeSections,
            datasets: [
                { label:'ê°œì¸ ?•ë‹µë¥?%)', data:pctPersonal, borderColor:'#e74c3c', backgroundColor:'rgba(231,76,60,0.15)', borderWidth:2.5, pointBackgroundColor:'#e74c3c', pointBorderColor:'#fff', pointRadius:4 },
                { label:'?‰ê·  ?•ë‹µë¥?%)', data:pctAvg,      borderColor:'#94a3b8', backgroundColor:'rgba(148,163,184,0.1)', borderWidth:2, pointBackgroundColor:'#94a3b8' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0, max: 100,
                    ticks: { stepSize: 20, font:{size:20}, backdropColor:'transparent', callback: v => v+'%' },
                    pointLabels: { font:{size:20} }
                }
            },
            plugins: {
                legend: { position: 'right', labels: { font:{size:20} } },
                tooltip: {
                    bodyFont:{size:20}, titleFont:{size:20},
                    callbacks: {
                        label: (ctx) => {
                            const i = ctx.dataIndex;
                            const ds = ctx.datasetIndex;
                            const raw = ds === 0 ? rawPersonal[i] : rawAvg[i];
                            const mx  = maxScores[i];
                            return ` ${ctx.dataset.label}: ${parseFloat(ctx.raw).toFixed(1)}% (${parseFloat(raw).toFixed(1)}/${mx}??`;
                        }
                    }
                }
            }
        }
    });
}


// ?ì—­ë³?ê°œë³„ AI ì½”ë©˜???¬ìƒ??
async function regenerateSectionComment(section) {
    if (!window.currentReportData) { showToast('? ï¸ ?±ì  ?°ì´?°ê? ?†ìŠµ?ˆë‹¤.'); return; }
    const { record, averages, activeSections, sectionComments, overallComment } = window.currentReportData;

    // ë²„íŠ¼ ë¡œë”© ?œì‹œ
    const btn = document.querySelector(`button[onclick="regenerateSectionComment('${section}')"]`);
    if (btn) { btn.disabled = true; btn.textContent = '???ì„± ì¤?..'; }

    try {
        // ?´ë‹¹ ?¹ì…˜ë§??¬ìƒ??
        const newComments = await generateSectionComments(record, averages, [section]);
        const updated = { ...(sectionComments || {}), ...newComments };

        // currentReportData ?…ë°?´íŠ¸
        window.currentReportData.sectionComments = updated;

        // ì¹´ë“œ ì½”ë©˜???ì—­ë§?ì§ì ‘ ?…ë°?´íŠ¸ (?„ì²´ ë¦¬ë Œ???†ì´)
        const secItems = activeSections.map(s => [s, updated[s]]);
        renderReportCard(record, averages, updated, overallComment, activeSections);
        showToast(`??${section} ì½”ë©˜???¬ìƒ???„ë£Œ!`);
    } catch(e) {
        showToast('???¬ìƒ???¤íŒ¨: ' + e.message);
        if (btn) { btn.disabled = false; btn.textContent = '?”„ ?¬ìƒ??; }
    }
}

async function triggerAIAnalysis() {
    if (!window.currentReportData) return;
    const { record, averages, activeSections } = window.currentReportData;
    toggleLoading(true);
    try {
        showToast('?¤– AI ?ì—­ë³?ì½”ë©˜???ì„± ì¤?..');

        // 1?¨ê³„: ?ì—­ë³?ì½”ë©˜??ë¨¼ì? ?ì„±
        const sectionComments = await generateSectionComments(record, averages, activeSections);

        showToast('?¤– ?ì—­ë³?ì½”ë©˜???„ë£Œ! ì¢…í•© ì½”ë©˜???ì„± ì¤?..');

        // 2?¨ê³„: ?ì—­ë³?ì½”ë©˜?¸ë? ê¸°ë°˜?¼ë¡œ ì¢…í•© ì½”ë©˜???ì„±
        const overallComment = await generateOverallComment(record, averages, activeSections, sectionComments);

        // ì½”ë©˜???€??
        window.currentReportData.sectionComments = sectionComments;
        window.currentReportData.overallComment   = overallComment;
        renderReportCard(record, averages, sectionComments, overallComment, activeSections);
        showToast('??AI ë¶„ì„ ?„ë£Œ!');

        // GAS ?ë™ ?€??(ë¹„ë™ê¸??¤í–‰?¼ë¡œ UI ë¸”ë¡œ???†ìŒ)
        const catVal2 = document.getElementById('report-category')?.value;
        const stuVal2 = document.getElementById('report-student')?.value;
        if (catVal2 && stuVal2) {
            const _aiCat   = globalConfig.categories?.find(c => c.id === catVal2);
            const _aiFolId = _aiCat ? extractFolderId(_aiCat.targetFolderUrl) : null;
            if (_aiFolId) {
                sendReliableRequest({
                    type: 'SAVE_AI_COMMENT',
                    parentFolderId: _aiFolId,
                    studentId: stuVal2,
                    overallComment,
                    sectionComments
                }).then(() => showToast('?’¾ AI ì½”ë©˜???€???„ë£Œ'))
                  .catch(e => console.warn('AI ì½”ë©˜??GAS ?€???¤íŒ¨:', e));
            }
        }
    } catch (e) {
        console.error(e);
        showToast('??AI ë¶„ì„ ?¤íŒ¨: ' + e.message);
    } finally {
        toggleLoading(false);
    }
}

// ===== ë¬¸í•­ ?µê³„ ?œìŠ¤??=====

// ë¬¸í•­ ?µê³„ ?€?œë³´??UI ?Œë”ë§?
function renderStats(c) {
    if (!globalConfig.categories || globalConfig.categories.length === 0) {
        renderEmptyState(c, 'Question Statistics');
        return;
    }

    setCanvasId('07');
    c.innerHTML = `
                <div class="animate-fade-in-safe space-y-6 pb-10">
                    <h2 class="fs-32 text-[#013976] leading-none font-black uppercase !border-none !pb-0">Statistics</h2>

                    <!-- ?¤ë”???”ì†Œ ? íƒ + ?µê³„ ëª¨ë“œ ë²„íŠ¼ -->
                    <div class="card !py-3.5 !px-6 !flex-row !flex-nowrap items-center justify-between shadow-lg relative overflow-hidden flex-none gap-4" style="background: linear-gradient(135deg, #ffffff 0%, #eef4ff 100%); border: 2px solid rgba(1,57,118,0.15);">
                        <div style="position:absolute; top:0; left:0; right:0; height:3px; background: linear-gradient(90deg, #60a5fa, #6366f1, #a855f7);"></div>
                        <div class="flex items-center gap-4 flex-grow">
                            <span style="font-size:17px;font-weight:700;color:#013976;white-space:nowrap;">?“‚ ?œí—˜ì§€ ? íƒ</span>
                            <select id="stats-category" onchange="onStatsCategoryChange()" class="ys-field flex-grow !font-normal !text-[#013976] !bg-white !text-[16px]">
                                <option value="" disabled selected hidden>?œí—˜ì§€ë¥?? íƒ?˜ì„¸??/option>
                                ${globalConfig.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <button id="btn-q-stats" onclick="switchStatsMode('question')" class="btn-ys !bg-[#013976] !text-white hover:brightness-110 !px-5 !py-2.5 !text-[15px] !font-black rounded-xl shadow-md whitespace-nowrap flex items-center gap-2">?“Š ë¬¸í•­ ?µê³„</button>
                            <button id="btn-s-stats" onclick="switchStatsMode('student')" class="btn-ys !bg-white !text-slate-500 !border-2 !border-slate-300 hover:!border-purple-500 hover:!text-purple-700 !px-5 !py-2.5 !text-[15px] !font-black rounded-xl whitespace-nowrap flex items-center gap-2">?‘¥ ?™ìƒ ?µê³„</button>
                        </div>
                        <!-- ?™ìƒ ?µê³„ ?„ë„ ?„í„° (hidden by default) -->
                        <div id="year-filter-wrap" class="hidden w-full flex items-center gap-3 pt-2 border-t border-slate-200 mt-1">
                            <span style="font-size:17px;font-weight:700;color:#64748b;white-space:nowrap;">?“… ?„ë„</span>
                            <select id="stats-year" onchange="loadStudentStats()" class="ys-field !w-36">
                                <option value="">?„ì²´</option>
                                ${Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(y => `<option value="${y}">${y}??/option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- ?µê³„ ?œì‹œ ?ì—­ -->
                    <div id="stats-display"></div>
                </div>
            `;

    // ê¸°ë³¸?€ ë¬¸í•­ ?µê³„ ëª¨ë“œ
    window._statsMode = 'question';
    loadQuestionStats();
}

// ===================== ?µê³„ ëª¨ë“œ ?„í™˜ =====================
function switchStatsMode(mode) {
    window._statsMode = mode;
    const qBtn = document.getElementById('btn-q-stats');
    const sBtn = document.getElementById('btn-s-stats');
    const yearWrap = document.getElementById('year-filter-wrap');
    const ON  = 'px-4 py-2 rounded-xl fs-14 font-bold border-2 border-[#013976] bg-[#013976] text-white transition-all';
    const OFF = 'px-4 py-2 rounded-xl fs-14 font-bold border-2 border-slate-300 text-slate-500 hover:border-purple-500 hover:text-purple-700 transition-all';
    if (qBtn) qBtn.className = mode === 'question' ? ON : OFF;
    if (sBtn) sBtn.className = mode === 'student'  ? ON : OFF;
    if (yearWrap) yearWrap.classList.toggle('hidden', mode !== 'student');
    if (mode === 'question') loadQuestionStats();
    else loadStudentStats();
}

function onStatsCategoryChange() {
    if (window._statsMode === 'student') loadStudentStats();
    else loadQuestionStats();
}

// ===================== ?™ìƒ ?µê³„ =====================
async function loadStudentStats() {
    const categoryId = document.getElementById('stats-category')?.value;
    if (!categoryId) return;
    const category = globalConfig.categories.find(c => c.id === categoryId);
    if (!category) return;
    const folderId = extractFolderId(category.targetFolderUrl);
    const selectedYear = document.getElementById('stats-year')?.value || '';

    toggleLoading(true);
    try {
        const result = await sendReliableRequest({
            type: 'GET_STUDENT_LIST',
            parentFolderId: folderId,
            categoryName: category.name
        });
        let students = result.data || [];
        // ?„ë„ ?„í„°
        if (selectedYear) {
            students = students.filter(s => {
                const d = String(s['?‘ì‹œ??] || s.testDate || s.date || '');
                return d.startsWith(selectedYear);
            });
        }
        renderStudentStatsUI(students, selectedYear);
    } catch(e) {
        document.getElementById('stats-display').innerHTML =
            `<div class="card text-center text-red-400">?¤ë¥˜: ${e.message}</div>`;
    } finally { toggleLoading(false); }
}

function renderStudentStatsUI(students, yearLabel) {
    const display = document.getElementById('stats-display');
    const SECTIONS = ['Grammar', 'Writing', 'Reading', 'Listening', 'Vocabulary'];
    const scoreKey = { Grammar:'grammarScore', Writing:'writingScore', Reading:'readingScore', Listening:'listeningScore', Vocabulary:'vocabScore' };
    const maxKey =   { Grammar:'grammarMax',   Writing:'writingMax',   Reading:'readingMax',   Listening:'listeningMax',  Vocabulary:'vocabMax' };

    const calcAvg = (list, sec) => {
        const vals = list.map(s => {
            const v = parseFloat(s[scoreKey[sec]] ?? s[sec+'_?ìˆ˜'] ?? '');
            return isNaN(v) ? null : v;
        }).filter(v => v !== null);
        return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '-';
    };
    const calcMaxAvg = (list, sec) => {
        const vals = list.map(s => {
            const v = parseFloat(s[maxKey[sec]] ?? s[sec+'_ë§Œì '] ?? '');
            return isNaN(v) ? null : v;
        }).filter(v => v !== null);
        return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '-';
    };

    const sectionHeader = SECTIONS.map(s=>`<th class="px-3 py-2 text-center">${s}</th>`).join('');
    const totalRow = (label, count, list, extraClass='') =>
        `<tr class="${extraClass} border-b border-slate-100">
            <td class="px-4 py-3 font-bold">${label}</td>
            <td class="px-4 py-3 text-center font-bold text-[#013976]">${count}</td>
            ${SECTIONS.map(s=>{
                const avg = calcAvg(list, s);
                const maxAvg = calcMaxAvg(list, s);
                return `<td class="px-3 py-3 text-center">${avg === '-' ? '<span class="text-slate-300">-</span>' : `<span class="font-bold">${avg}</span><br><span class="text-slate-400 fs-12">/${maxAvg}</span>`}</td>`;
            }).join('')}
        </tr>`;

    // ?™ê¸‰ë³?ê·¸ë£¹??
    const groups = {};
    students.forEach(s => {
        const cls = s.studentClass || s['?±ë¡?™ê¸‰'] || '(ë¯¸ì…??';
        if (!groups[cls]) groups[cls] = [];
        groups[cls].push(s);
    });

    const groupRows = Object.entries(groups)
        .sort(([a],[b])=>a.localeCompare(b))
        .map(([cls, list], i) => totalRow(
            `<span class="text-purple-700">${cls}</span>`, list.length, list,
            i % 2 === 0 ? 'bg-purple-50/30' : ''
        )).join('');

    const yearStr = yearLabel ? `${yearLabel}?? : '?„ì²´';

    display.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <div class="card">
                <h3 class="fs-18 font-black text-[#013976] mb-4">?“Š ?„ì²´ ?µê³„ <span class="fs-14 text-slate-400 font-normal ml-2">${yearStr} Â· ì´?${students.length}ëª?/span></h3>
                ${students.length === 0 ? '<p class="text-slate-400 text-center py-6">?´ë‹¹ ì¡°ê±´???™ìƒ ?°ì´?°ê? ?†ìŠµ?ˆë‹¤.</p>' : `
                <div class="overflow-x-auto rounded-xl border border-slate-200">
                    <table class="w-full text-[14px]">
                        <thead class="bg-[#013976] text-white"><tr>
                            <th class="px-4 py-2.5 text-left">êµ¬ë¶„</th>
                            <th class="px-4 py-2.5 text-center">?‘ì‹œ?ìˆ˜</th>
                            ${sectionHeader}
                        </tr></thead>
                        <tbody>
                            ${totalRow('?„ì²´ ?‰ê· ', students.length, students, 'bg-blue-50/40')}
                        </tbody>
                    </table>
                </div>`}
            </div>

            <div class="card">
                <h3 class="fs-18 font-black text-[#013976] mb-4">?« ?™ê¸‰ë³??µê³„ <span class="fs-14 text-slate-400 font-normal ml-2">${yearStr}</span></h3>
                ${Object.keys(groups).length === 0 ? '<p class="text-slate-400 text-center py-6">?±ë¡?™ê¸‰ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤.</p>' : `
                <div class="overflow-x-auto rounded-xl border border-slate-200">
                    <table class="w-full text-[14px]">
                        <thead class="bg-purple-700 text-white"><tr>
                            <th class="px-4 py-2.5 text-left">?™ê¸‰</th>
                            <th class="px-4 py-2.5 text-center">?‘ì‹œ?ìˆ˜</th>
                            ${sectionHeader}
                        </tr></thead>
                        <tbody>${groupRows}</tbody>
                    </table>
                </div>`}
            </div>
        </div>`;
}

// ë¬¸í•­ ?µê³„ ?°ì´??ë¡œë“œ
async function loadQuestionStats() {
    const categoryId = document.getElementById('stats-category').value;
    if (!categoryId) return; // ?œí—˜ì§€ ? íƒ ?„ì—???™ì‘?˜ì? ?ŠìŒ
    const category = globalConfig.categories.find(c => c.id === categoryId);
    if (!category) return;

    const folderId = extractFolderId(category.targetFolderUrl);
    if (!folderId) {
        showToast("? ï¸ ?´ë” IDë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.");
        return;
    }

    toggleLoading(true);
    try {
        const payload = {
            type: 'GET_FULL_DB', // [Modified] Use Integrated DB for stats too
            parentFolderId: folderId,
            categoryName: category.name
        };

        const result = await sendReliableRequest(payload);

        let questionsToUse = [];
        if (result.status === "Success") {
            questionsToUse = result.questions || [];
        } else {
            console.warn("Stats Fetch Failed, checking local cache...");
        }

        // [Fallback] Check Local Cache if Fetch Empty
        if (questionsToUse.length === 0) {
            if (globalConfig.questions && globalConfig.questions.length > 0) {
                // Try to filter by category if we track it, or just use if it matches current context
                // Since we don't strictly track categoryId in questions, we verify if they look relevant?
                // Simple approach: data-collection uses globalConfig.questions for current session.
                // Let's assume globalConfig.questions might be relevant if Bank loaded it.
                console.log("Using cached questions for stats");
                questionsToUse = globalConfig.questions;
            }
        }

        if (questionsToUse.length === 0) {
            document.getElementById('stats-display').innerHTML = '<div class="card text-center text-slate-500">ë¬¸í•­ ?°ì´?°ê? ?†ìŠµ?ˆë‹¤. (?œë²„/ë¡œì»¬)</div>';
            return;
        }

        const stats = calculateQuestionStats(questionsToUse);
        renderStatsCharts(stats);
        showToast('???µê³„ ë¡œë“œ ?„ë£Œ!');

    } catch (err) {
        console.error(err);
        showToast("? ï¸ ?µê³„ ë¡œë“œ ?¤íŒ¨: " + err.message);
    } finally {
        toggleLoading(false);
    }
}

// ?µê³„ ?°ì´??ê³„ì‚°
function calculateQuestionStats(questions) {
    const total = questions.length;

    // ?ì—­ë³?ì§‘ê³„
    const sections = {};
    const sectionScores = {}; // [NEW] ?ì—­ë³?ë°°ì  ?©ê³„
    const types = {};
    const difficulties = {};
    const scores = {};

    questions.forEach(q => {
        const section = q.section || q['?ì—­'] || 'ë¯¸ë¶„ë¥?;
        sections[section] = (sections[section] || 0) + 1;
        const sc = parseFloat(q.score || q['ë°°ì '] || 1);
        sectionScores[section] = (sectionScores[section] || 0) + sc; // [NEW]

        const type = q.type || q['ë¬¸í•­? í˜•'] || 'ê°ê???;
        types[type] = (types[type] || 0) + 1;

        const difficulty = q.difficulty || q['?œì´??] || 'ì¤?;
        difficulties[difficulty] = (difficulties[difficulty] || 0) + 1;

        const score = q.score || q['ë°°ì '] || 1;
        scores[score] = (scores[score] || 0) + 1;
    });

    return { total, sections, sectionScores, types, difficulties, scores };
}

// ?µê³„ ì°¨íŠ¸ ?Œë”ë§?
function renderStatsCharts(stats) {
    const display = document.getElementById('stats-display');

    display.innerHTML = `
                <div class="space-y-8 animate-fade-in-safe">
                    <!-- ?”ì•½ ?•ë³´ ë°?(??ì¤?ì»´íŒ©?? -->
                    ${(() => {
                        const totalScore = Object.entries(stats.scores).reduce((sum, [pt, cnt]) => sum + parseFloat(pt) * cnt, 0);
                        const scoreBreakdown = Object.entries(stats.scores).sort((a,b) => parseFloat(a[0]) - parseFloat(b[0])).map(([pt, cnt]) => `${pt}?Ã?{cnt}`).join(' / ');
                        const sectionBreakdown = Object.entries(stats.sections).map(([sec, cnt]) => {
                            const secScore = Math.round(stats.sectionScores?.[sec] || 0);
                            return `<span style="font-size:14px;"><span class="font-bold text-[#013976]">${sec}</span> ${cnt}ê°?span class="text-slate-400">(${secScore}??</span></span>`;
                        }).join('<span class="text-slate-300 mx-2" style="font-size:14px;">|</span>');
                        return `
                        <div class="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                            <div class="flex items-center gap-2 shrink-0">
                                <span class="text-slate-500 font-bold" style="font-size:17px;">?“‹ ì´?ë¬¸í•­</span>
                                <span class="text-[#013976] font-black" style="font-size:26px;">${stats.total}<span class="text-slate-400 font-bold" style="font-size:14px;">ê°?/span></span>
                            </div>
                            <div class="w-px h-7 bg-blue-200 shrink-0 hidden md:block"></div>
                            <div class="flex items-center gap-2 shrink-0">
                                <span class="text-slate-500 font-bold" style="font-size:17px;">?’¯ ì´?ë°°ì </span>
                                <span class="text-[#013976] font-black" style="font-size:26px;">${totalScore}<span class="text-slate-400 font-bold" style="font-size:14px;">??/span></span>
                            </div>
                            <div class="w-px h-7 bg-blue-200 shrink-0 hidden md:block"></div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-slate-500 font-bold shrink-0" style="font-size:17px;">?“š ?ì—­ë³?ë¬¸í•­ê³?ë°°ì </span>
                                <span class="text-slate-600">${sectionBreakdown}</span>
                            </div>
                        </div>`;
                    })()}
                    
                    <!-- ì°¨íŠ¸ ê·¸ë¦¬??-->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- ?ì—­ë³?-->
                        <div class="card">
                            <h3 class="ys-label mb-0">?“š ?ì—­ë³?ë¶„í¬</h3>
                            <div style="height: 300px;">
                                <canvas id="chart-sections-stat"></canvas>
                            </div>
                        </div>
                        
                        <!-- ? í˜•ë³?-->
                        <div class="card">
                            <h3 class="ys-label mb-0">?“ ? í˜•ë³?ë¶„í¬</h3>
                            <div style="height: 300px;">
                                <canvas id="chart-types-stat"></canvas>
                            </div>
                        </div>
                        
                        <!-- ?œì´?„ë³„ -->
                        <div class="card">
                            <h3 class="ys-label mb-0">â­??œì´?„ë³„ ë¶„í¬</h3>
                            <div style="height: 300px;">
                                <canvas id="chart-difficulties-stat"></canvas>
                            </div>
                        </div>
                        
                        <!-- ë°°ì ë³?-->
                        <div class="card">
                            <h3 class="ys-label mb-0">?¯ ë°°ì ë³?ë¶„í¬</h3>
                            <div style="height: 300px;">
                                <canvas id="chart-scores-stat"></canvas>
                            </div>
                        </div>
                </div>
            `;

    // ì°¨íŠ¸ ?Œë”ë§?
    setTimeout(() => {
        renderStatDoughnut('chart-sections-stat', stats.sections, stats.total, '?ì—­');
        renderStatDoughnut('chart-types-stat', stats.types, stats.total, '? í˜•');
        renderStatDoughnut('chart-difficulties-stat', stats.difficulties, stats.total, '?œì´??);
        renderStatBar('chart-scores-stat', stats.scores);
    }, 100);
}

// ?„ë„› ì°¨íŠ¸ ?Œë”ë§?(?µê³„??
function renderStatDoughnut(canvasId, data, total, label) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = Object.keys(data);
    const values = Object.values(data);

    // [Plugin] ?¬ë¼?´ìŠ¤ ?´ë? ?«ì ?œì‹œ
    const innerLabelPlugin = {
        id: 'innerLabel_' + canvasId,
        afterDatasetsDraw(chart) {
            const { ctx: c, data } = chart;
            const dataset = data.datasets[0];
            const meta = chart.getDatasetMeta(0);
            const dataTotal = dataset.data.reduce((a, b) => a + b, 0);

            meta.data.forEach((arc, index) => {
                const value = dataset.data[index];
                if (!value || value === 0) return;
                const pct = (value / dataTotal) * 100;
                if (pct < 5) return; // ?ˆë¬´ ?‘ì? ?¬ë¼?´ìŠ¤???ëµ

                const midAngle = arc.startAngle + (arc.endAngle - arc.startAngle) / 2;
                const radius = (arc.innerRadius + arc.outerRadius) / 2;
                const x = arc.x + radius * Math.cos(midAngle);
                const y = arc.y + radius * Math.sin(midAngle);

                c.save();
                c.textAlign = 'center';
                c.textBaseline = 'middle';
                c.fillStyle = 'white';
                c.font = 'bold 14px sans-serif';
                c.shadowColor = 'rgba(0,0,0,0.3)';
                c.shadowBlur = 3;
                c.fillText(`${value}ê°?, x, y - 9);
                c.font = '14px sans-serif';
                c.fillText(`${pct.toFixed(0)}%`, x, y + 9);
                c.restore();
            });
        }
    };

    new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#4A90E2',
                    '#50C878',
                    '#FFB84D',
                    '#FF6B6B',
                    '#9B59B6',
                    '#1ABC9C',
                    '#E74C3C',
                    '#3498DB'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: -20, bottom: 0 }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const itemLabel = context.label || '';
                            const value = context.parsed;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${itemLabel}: ${value}ê°?(${percentage}%)`;
                        }
                    }
                },
                legend: {
                    position: 'right',
                    labels: {
                        padding: 12,
                        font: {
                            size: 14
                        }
                    }
                }
            }
        },
        plugins: [innerLabelPlugin]
    });
}

// ë°?ì°¨íŠ¸ ?Œë”ë§?(?µê³„??
function renderStatBar(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = Object.keys(data).sort((a, b) => parseFloat(a) - parseFloat(b));
    const values = labels.map(l => data[l]);

    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels.map(l => l + '??),
            datasets: [{
                label: 'ë¬¸í•­ ??,
                data: values,
                backgroundColor: '#4A90E2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.parsed.y}ê°?;
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { size: 14 }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: { size: 14 }
                    }
                }
            }
        }
    });
}



// --- ë¬¸í•­ ë±…í¬ ?œìŠ¤??(List View) ---
// [New] ê·¸ë£¹ ?‰ìƒ ?ì„±ê¸?(10ê°€ì§€ ê³ ì • ?”ë ˆ??
function getGroupColor(index) {
    const palette = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
        'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
        'bg-cyan-500', 'bg-sky-500'
    ];
    return palette[index % palette.length];
}

// [Refactor] ë¬¸í•­ ë±…í¬ ?Œë”ë§?(Canvas 08)
// [New] Bank Category Change Handler
function handleBankCategoryChange(catId) {
    curCatId = catId;
    loadBankQuestions(catId);
}

// [New] Load Bank Questions
// [New] Load Bank Questions
async function loadBankQuestions(catId) {
    const category = globalConfig.categories.find(c => c.id === catId);
    if (!category) return;

    const folderId = extractFolderId(category.targetFolderUrl);
    if (!folderId) {
        showToast("? ï¸ ?´ë” ID ?¤ë¥˜: ì¹´í…Œê³ ë¦¬ ?¤ì •???•ì¸?˜ì„¸??");
        return;
    }

    toggleLoading(true);
    try {
        const payload = {
            type: 'GET_FULL_DB', // [Modified] Use Integrated DB
            parentFolderId: folderId,
            categoryName: category.name
        };

        const result = await sendReliableRequest(payload);

        // [Robustness] Handle Data
        let newQuestions = [];
        let newBundles = [];

        if (result.status === "Success") {
            newQuestions = result.questions || [];
            newBundles = result.bundles || [];
        } else {
            console.warn("Bank Fetch Failed/Empty. Checking cache...");
        }

        // [Fallback] Local Cache
        if (newQuestions.length === 0 && globalConfig.questions) {
            console.log("Using cached questions for Bank Master");
            // Filter by category? globalConfig.questions might be mixed or current.
            // Best effort: usage current cache.
            newQuestions = globalConfig.questions;
            // bundles?
            if (globalConfig.bundles) newBundles = globalConfig.bundles;
        }

        if (newQuestions.length === 0) {
            showToast("? ï¸ ë¬¸í•­ ?°ì´?°ê? ?†ìŠµ?ˆë‹¤.");
        } else {
            // [Fix] Inject catId mapping since the server response does not contain it directly for independent fetching
            newQuestions = newQuestions.map(q => ({ ...q, catId: catId }));

            // Update Global Config
            // ê¸°ì¡´ ë¬¸í•­ ì¤??¤ë¥¸ ì¹´í…Œê³ ë¦¬??ë¬¸í•­?€ ? ì??˜ê³  ?„ì¬ ì¹´í…Œê³ ë¦¬ ë¬¸í•­ë§???–´?°ê¸°
            if (globalConfig.questions) {
                const otherCategoryQuestions = globalConfig.questions.filter(q => String(q.catId) !== String(catId));
                globalConfig.questions = [...otherCategoryQuestions, ...newQuestions];
            } else {
                globalConfig.questions = newQuestions;
            }

            // Merge Bundles (Don't overwrite if empty?)
            if (newBundles.length > 0) {
                if (!globalConfig.bundles) globalConfig.bundles = [];
                const incomingIds = new Set(newBundles.map(b => b.id));
                globalConfig.bundles = globalConfig.bundles.filter(b => !incomingIds.has(b.id));
                globalConfig.bundles.push(...newBundles);
            }

            save(); // Save to local storage
            renderBankRows();
            showToast(`??ë¬¸í•­ ${newQuestions.length}ê°?ë¡œë“œ ?„ë£Œ`);
        }

    } catch (e) {
        console.error(e);
        showToast("??ë¬¸í•­ ë¡œë“œ ?¤íŒ¨: " + e.message);
    } finally {
        toggleLoading(false);
    }
}
function renderBank(c) {
    if (!c) c = document.getElementById('dynamic-content');

    // [Fix] ì§„ì… ??app-canvas ?ˆì´?„ì›ƒ ?„ì „ ë³µì› (?´ëŠ ??—???€???•ìƒ??
    const _ac = document.getElementById('app-canvas');
    if (_ac) {
        _ac.style.padding = '';
        _ac.style.overflow = '';
        _ac.style.overflowY = '';
        _ac.classList.remove('!p-0', '!overflow-hidden');
    }
    c.className = 'w-full h-full';

    // [Fix] curCatId ? ì?: 07-2 ë³µê? ??ì§ì „ ? íƒ ì¹´í…Œê³ ë¦¬ê°€ ?ˆìœ¼ë©?ê·¸ë?ë¡?? ì?
    // (? ê·œ ì§„ì… ?œì—??curCatIdê°€ ?´ë? "" ?´ì–´???ë™?¼ë¡œ placeholder ? íƒ)
    if (!globalConfig.categories || globalConfig.categories.length === 0) {
        renderEmptyState(c, 'Question Bank Master');
        return;
    }
    setCanvasId('08');

    c.innerHTML = `
        <div class="animate-fade-in-safe flex flex-col h-full space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="fs-32 text-[#013976] leading-none font-black uppercase !border-none !pb-0">Question List</h2>
            </div>

            <!-- ì¹´í…Œê³ ë¦¬ ? íƒ -->
            <div class="card !py-3.5 !px-6 flex flex-row items-center justify-between shadow-lg relative overflow-hidden flex-none gap-4 flex-nowrap" style="background: linear-gradient(135deg, #ffffff 0%, #eef4ff 100%); border: 2px solid rgba(1,57,118,0.15);">
                <div style="position:absolute; top:0; left:0; right:0; height:3px; background: linear-gradient(90deg, #60a5fa, #6366f1, #a855f7);"></div>
                <div class="flex items-center gap-4 flex-grow">
                    <label class="ys-label !mb-0 whitespace-nowrap !text-[#013976] font-bold">?“‚ ?œí—˜ì§€ ? íƒ</label>
                    <select onchange="handleBankCategoryChange(this.value)" 
                            class="ys-field flex-grow !font-normal !text-[#013976] !bg-white !text-[16px]">
                        <option value="" disabled ${!curCatId ? 'selected' : ''} hidden>?œí—˜ì§€ë¥?? íƒ?˜ì„¸??/option>
                        ${globalConfig.categories.map(cat => `<option value="${cat.id}" ${curCatId === cat.id ? 'selected' : ''} class="text-[#013976] !text-[16px] !font-normal">${cat.name}</option>`).join('')}
                    </select>
                </div>
                <button onclick="changeTab('reg')" class="btn-ys !bg-[#013976] !text-white !border-[#013976] hover:brightness-110 !px-5 !py-2.5 !text-[15px] !font-black rounded-xl shadow-md whitespace-nowrap flex-shrink-0 flex items-center gap-2">
                    ??ë¬¸í•­ ?±ë¡
                </button>
            </div>

            <div class="flex-grow overflow-hidden bg-white rounded-2xl border border-slate-200 flex flex-col shadow-sm">
                <!-- ?¤ë” (Grid Layout) -->
                <div class="grid grid-cols-[60px_100px_120px_1fr_80px_80px] bg-slate-100 border-b border-slate-200 p-4 font-bold text-[#013976] text-center fs-16 uppercase tracking-wider sticky top-0 z-10">
                    <div>GRP</div>
                    <div>SEC</div>
                    <div>TYPE</div>
                    <div>QUESTION TITLE (ë°œë¬¸)</div>
                    <div>PTS</div>
                    <div>EDIT</div>
                </div>
                
                <!-- ë¦¬ìŠ¤???ì—­ -->
                <div id="bank-list-container" class="overflow-y-auto flex-grow p-2 space-y-2 bg-slate-50/50">
                     <div class="p-20 text-center text-slate-400">?‘ˆ ì¹´í…Œê³ ë¦¬ë¥?? íƒ?˜ì„¸??/div>
                </div>
            </div>
        </div>
    `;
}

// [Refactor] Bank Rows Rendering
function renderBankRows() {
    const container = document.getElementById('bank-list-container');
    if (!container) return; // ?¸ì¶œ ?œì ??ì»¨í…Œ?´ë„ˆê°€ ?†ì„ ???ˆìŒ (e.g. ???„í™˜ ì§í›„)

    const list = globalConfig.questions.filter(q => q.catId === curCatId);

    if (list.length === 0) {
        container.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-400 p-10">
                    <span class="text-4xl mb-4">?“­</span>
                    <p class="fs-18">?±ë¡??ë¬¸í•­???†ìŠµ?ˆë‹¤.</p>
                </div>`;
        return;
    }

    // ê·¸ë£¹ ?¸ë±??ë§¤í•‘ (Passage ID + Common Title ê¸°ì?)
    const groupMap = new Map(); // Key: ID -> ColorIdx
    let groupMapCounter = 0;

    list.forEach((q, i) => {
        // ê·¸ë£¹ ?? passageIdê°€ ?ˆìœ¼ë©?ìµœìš°?? ?†ìœ¼ë©?commonTitle (?? commonTitle???ˆì–´????
        let key = q.passageId || (q.commonTitle ? `CT_${q.commonTitle}` : null);
        const prev = list[i - 1];

        // ?°ì†??ì²´í¬: ?´ì „ ??ª©ê³?ê°™ì? ?¤ë? ê³µìœ ?˜ëŠ”ê°€?
        const isConnected = prev && (
            (q.passageId && q.passageId === prev.passageId) ||
            (q.commonTitle && q.commonTitle === prev.commonTitle)
        );

        if (!isConnected) {
            if (key) groupMapCounter++;
        }

        if (key) {
            groupMap.set(q.id, groupMapCounter);
        }
    });

    let html = '';

    list.forEach((q, idx) => {
        let groupColorClass = 'bg-slate-200'; // Default: Single
        let isBundle = false;

        let key = q.passageId || (q.commonTitle ? `CT_${q.commonTitle}` : null);
        if (key && groupMap.has(q.id)) {
            const cIdx = groupMap.get(q.id);
            groupColorClass = getGroupColor(cIdx);
            isBundle = true;
        }

        const groupKeyEncoded = key ? encodeURIComponent(key) : '';

        html += `
            <div class="bank-row grid grid-cols-[60px_100px_120px_1fr_80px_80px] items-center p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group select-none hover:bg-blue-50"
                 data-id="${q.id}"
            >
                <!-- Group Indicator -->
                <div class="flex justify-center">
                    <div class="w-9 h-9 rounded-lg ${isBundle ? groupColorClass : 'bg-[#013976]'} flex items-center justify-center text-white font-bold text-sm shadow-sm transform transition-transform group-hover:scale-110">
                        ${idx + 1}
                    </div>
                </div>
                
                <!-- Section -->
                <div class="text-center">
                    <span class="px-2.5 py-1 rounded-md fs-16 font-bold border ${
                        q.section === 'Reading' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        q.section === 'Grammar' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        q.section === 'Vocabulary' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        q.section === 'Listening' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        q.section === 'Writing' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                    }">
                        ${q.section || '-'}
                    </span>
                </div>
                
                <!-- Type -->
                <div class="text-center fs-16 truncate px-2 font-bold ${
                    (q.questionType || q.type || '').includes('ê°ê?') ? 'text-blue-600' : 'text-rose-600'
                }">
                    ${q.questionType || q.type || '-'}
                </div>
                
                <!-- Content -->
                <div class="px-4 text-slate-700 font-medium truncate fs-16 leading-snug">
                    ${q.title || q.text || q.questionTitle || '-'}
                </div>
                
                <!-- Score -->
                <div class="text-center text-blue-600 font-bold fs-16">
                    ${q.score}
                </div>

                <!-- Edit -->
                <div class="text-center">
                    <button onclick="renderEditForm('${q.id}')" class="btn-ys !bg-white !text-indigo-600 !border-indigo-200 hover:bg-indigo-50 !py-1 !px-3 font-bold text-xs shadow-sm" onmousedown="event.stopPropagation()">
                        ?ï¸
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// 5. [ê¸°ëŠ¥] ?¸ë? ? í˜• ëª©ë¡ ?…ë°?´íŠ¸ (Universal)
// 5. [ê¸°ëŠ¥] ?¸ë? ? í˜• ëª©ë¡ ?…ë°?´íŠ¸
function upDet(v) {
    const s = document.getElementById('q-subtype') || document.getElementById('q-det');
    if (!s) return;

    if (!v) {
        s.innerHTML = '<option value="" disabled selected hidden>ì£??ì—­??ë¨¼ì? ? íƒ?˜ì„¸??/option>';
        return;
    }

    const list = [...(SUB_TYPE_MAP[v] || [])];
    if (list.length === 0) {
        s.innerHTML = '<option value="" disabled selected hidden>?´ë‹¹ ?ì—­???¸ë? ??ª©???†ìŠµ?ˆë‹¤</option>';
    } else {
        s.innerHTML = '<option value="" disabled selected hidden>?¸ë? ?ì—­??? íƒ?˜ì„¸??/option>' + list.map(t => `<option value="${t}">${t}</option>`).join('');
    }
}

// 6. [ê¸°ëŠ¥] ê°ê???ë³´ê¸° ?…ë ¥ì°??Œë”ë§?(Dynamic Inputs)
function renderChoiceInputs(n, initialValues = null) {
    const container = document.getElementById('q-choices-container');
    if (!container) return;

    // ê¸°ì¡´ ê°?ë°±ì—… (ê°’ì´ ?ˆìœ¼ë©?? ì?)
    const oldValues = [];
    const existingInputs = container.querySelectorAll('input');
    existingInputs.forEach(input => oldValues.push(input.value));

    let html = '';
    for (let i = 1; i <= n; i++) {
        // ?°ì„ ?œìœ„: initialValues > ê¸°ì¡´ ?…ë ¥ê°?> ë¹?ë¬¸ì??
        let val = '';
        if (initialValues && initialValues[i - 1]) {
            val = initialValues[i - 1]; // "1. Apple"
        } else if (oldValues[i - 1]) {
            val = oldValues[i - 1];
        }
        // ë²ˆí˜¸ ?„ë¦¬?½ìŠ¤ ?œê±° (Ex: "1. Apple" -> "Apple")
        val = val.replace(/^\d+\.\s*/, '');
        html += `
                    <div class="flex items-center gap-3 animate-fade-in-safe">
                        <span class="text-slate-400 font-bold text-lg w-6 text-right">${i}.</span>
                        <input type="text" id="q-choice-${i}" class="ys-field !h-12 !text-base bg-white focus:bg-blue-50 transition-colors" 
                               placeholder="ë³´ê¸° ${i} ?´ìš©???…ë ¥?˜ì„¸??(Option ${i})" value="${val}">
                    </div>`;
    }
    container.innerHTML = html;
}

// --- ë¬¸í•­ ?±ë¡ ??(NEW UI) ---
// --- REFACTORED REGISTRATION & EDIT FORM (PROTOTYPE SPLIT VIEW) ---

// ê³µí†µ Sub-Area ?°ì´??
const REG_SUB_AREAS = {
    'Listening': ["ê³„ì‚°", "ê·¸ë¦¼ ë¬˜ì‚¬", "ëª©ì  ?Œì•…", "ë¬˜ì‚¬", "ë°›ì•„?°ê¸°", "?í™©?Œì•…", "?¸ë??¬í•­", "?¬ë¦¬/?¬ê²½", "?‘ë‹µ", "?•ë³´ ?”ì•½", "ì£¼ì œ", "?¨ì–´ ?…ë ¥", "ê¸°í?"],
    'Reading': ["ê¸€ ?”ì•½", "?´ìš© ?¼ì¹˜", "?€???Œì•…", "ëª©ì ", "ë¬¸ì¥ ?°ê²°??, "ë¬¸ì¥ ?„ì„±", "ë¬¸ì¥ ?˜ë?", "ë°‘ì¤„ ì¶”ë¡ ", "?¬ë¦¬/?¬ê²½", "ë¹ˆì¹¸ì¶”ë¡ ", "?½ì…", "?¸ë??¬í•­", "?œì„œ", "?´íœ˜ ì¶”ë¡ ", "?´íœ˜ ?œìš©", "?°ê²°??, "?”ì•½/?”ì?", "?¥ë¬¸ ë¹ˆì¹¸", "?¥ë¬¸ ?œëª©", "?œëª©", "ì£¼ì œ", "ì§€ì¹?, "ì¶”ë¡ ", "?ë¦„", "ê¸°í?"],
    'Vocabulary': ["?ˆë²¨1", "?ˆë²¨2", "?ˆë²¨3", "?ˆë²¨4", "?ˆë²¨5", "?ˆë²¨6", "?ˆë²¨7", "?ˆë²¨8", "?ˆë²¨9", "?™ì–´", "ê¸°í?"],
    'Writing': ["?ˆë²¨1", "?ˆë²¨2", "?ˆë²¨3", "?ˆë²¨4", "?ˆë²¨5", "?ˆë²¨6", "?ˆë²¨7", "?ˆë²¨8", "?ˆë²¨9", "ë¬¸ì¥ ?„ì„±", "ê¸€ ?”ì•½", "?‘ë¬¸", "ê¸°í?"],
    'Grammar': ["ê°€?•ë²•", "ê´€ê³„ë?ëª…ì‚¬", "ê´€ê³„ë???, "ê´€ê³„ì‚¬", "ê´€ê³„ì‚¬/?˜ë¬¸??, "ê´€ê³„ì‚¬/?‘ì†??, "?€ëª…ì‚¬", "ëª…ì‚¬", "ë³‘ë ¬ êµ¬ì¡°", "ë¶„ì‚¬", "ë¶„ì‚¬êµ¬ë¬¸", "ë¹„êµê¸?, "?˜ë™??, "?˜ì¼ì¹?, "?œì œ", "?¼ì¹˜/?”ë²•", "?‘ì†??, "ì¡°ë™??, "ì¤€?™ì‚¬", "ì§€ì¹?ë³µí•©", "?¹ìˆ˜êµ¬ë¬¸", "?•ì‹", "?•ìš©??, "?•ìš©??ë¶€??, "?”ë²•", "toë¶€?•ì‚¬", "toë¶€?•ì‚¬/?™ëª…??, "ê¸°í?"]
};

// Canvas 08-1: ë¬¸í•­ ?±ë¡ (Set Creation, Split View)
// [New] Exit Builder Mode Logic (Back Button & Exit Button)
function exitBuilderMode(force = false) {
    if (!force && !confirm("?‘ì„± ì¤‘ì¸ ?´ìš©?€ ?€?¥ë˜ì§€ ?ŠìŠµ?ˆë‹¤. ?˜ê??œê² ?µë‹ˆê¹?")) {
        // If triggered by back button (popstate), we need to push state back to stay
        history.pushState({ page: 'builder' }, '', '#builder');
        return;
    }

    // Cleanup History Listener
    window.onpopstate = null;
    window.removeEventListener('beforeunload', handleBeforeUnload);

    // Restore Layout
    document.body.classList.add('has-sidebar'); // Restore sidebar helper if needed, or just let CSS handle it
    // Actually, 'has-sidebar' removal was just for background color or specific overrides.
    // The critical part is restoring display:

    const globalHeader = document.getElementById('app-header');
    if (globalHeader) globalHeader.style.display = 'flex'; // Was flex

    const globalFooter = document.getElementById('app-footer');
    if (globalFooter) globalFooter.style.display = ''; // [Fix] CSS default(flex) ë³µì›

    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        mainContainer.style.marginTop = ''; // Reset to CSS default
        mainContainer.style.height = '';    // Reset to CSS default
    }

    // Restore URL
    history.replaceState(null, '', ' '); // Clear #builder

    // Render Bank (Canvas 08)
    const content = document.getElementById('dynamic-content');
    content.classList.remove('h-full'); // Remove full height override
    renderBank(content);
}

// Map this to global scope if needed for button onclick
window.exitBuilderMode = exitBuilderMode;

// --- Drag & Drop Form Builder (New 08-1) ---

// [New] BeforeUnload Handler (Shared)
function handleBeforeUnload(e) {
    e.preventDefault();
    e.returnValue = '?‘ì„± ì¤‘ì¸ ?´ìš©???€?¥ë˜ì§€ ?Šì•˜?µë‹ˆ?? ?•ë§ ?˜ê??œê² ?µë‹ˆê¹?'; // Chrome/Edge requirement (Text ignored but required to set)
    return e.returnValue; // Legacy
}

function renderRegForm() {
    // [Request] Hide Sidebar AND Header for Full Screen
    document.body.classList.remove('has-sidebar');

    // [History API] Push State for Back Button Protection
    history.pushState({ page: 'builder' }, '', '#builder');

    // [History API] Handle Back Button
    window.onpopstate = function (event) {
        exitBuilderMode();
    };
    // [Event] Prevent accidental tab close/reload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // [Global Layout Override]
    const globalHeader = document.getElementById('app-header');
    if (globalHeader) globalHeader.style.display = 'none';

    const globalFooter = document.getElementById('app-footer');
    if (globalFooter) globalFooter.style.display = 'none';

    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        mainContainer.style.marginTop = '0';
        mainContainer.style.height = '100vh';
    }

    setCanvasId('08-1', 'full'); // Full width
    const c = document.getElementById('dynamic-content');

    // Layout: Split View Container
    c.classList.add('h-full');
    c.innerHTML = `
        <!-- [Full Screen Layout] 100vh height since global header is hidden -->
        <div style="width: 100%; height: 100vh; background-color: #f8fafc; position: relative; overflow: hidden;">
            
            <!-- Builder Header (Block Element, Fixed Height) -->
            <div id="builder-header" style="display: flex; align-items: center; justify-content: space-between; width: 100%; height: 60px; background-color: white; border-bottom: 1px solid #e2e8f0; z-index: 500; position: relative; padding: 0 24px;">
                 <!-- Left: Title -->
                 <div class="flex items-center gap-4">
                    <h2 class="font-bold bg-[#013976] text-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2" style="font-size: 17px;">
                        <span class="text-xl">?“</span> Quiz Builder
                    </h2>
                    
                    <!-- Category Selection (Clean) -->
                    <div class="flex items-center gap-2">
                        <select id="reg-target-cat" class="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-sm font-bold text-[#013976] outline-none focus:border-blue-500 min-w-[200px] shadow-sm">
                            <option value="" disabled selected>ì¹´í…Œê³ ë¦¬(?œí—˜ì§€) ? íƒ</option>
                            ${globalConfig.categories ? globalConfig.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('') : ''}
                        </select>
                        <button onclick="loadQuestionsFromCategory()" class="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-1">
                            <span>?“‚</span> ë¶ˆëŸ¬?¤ê¸°
                        </button>
                    </div>
                </div>

                 <!-- Center: Toolbar Controls -->
                 <div class="flex items-center gap-2">
                    <button onclick="addComponent('bundle')" class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors font-bold text-sm shadow-sm hover:shadow active:scale-95">
                        <span>?“¦</span> ë¬¶ìŒ??
                    </button>
                    <button onclick="addComponent('obj')" class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors font-bold text-sm shadow-sm hover:shadow active:scale-95">
                        <span>??/span> ê°ê???
                    </button>
                    <button onclick="addComponent('subj')" class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors font-bold text-sm shadow-sm hover:shadow active:scale-95">
                        <span>?ï¸</span> ì£¼ê???
                    </button>
                 </div>
                
                <!-- Right: Actions -->
                <div class="flex items-center gap-2">
                     <!-- Split View Toggle -->
                     <button onclick="toggleSplitView()" id="btn-split-toggle" class="hidden text-sm font-bold text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded border border-slate-200 bg-white transition-colors flex items-center gap-1.5">
                        <span>?“–</span> ?ë¬¸
                     </button>

                     <!-- PDF Upload -->
                     <label class="btn-ys !bg-white !text-slate-600 !border-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-sm !px-3 !py-1.5 !text-sm !h-auto !rounded shrink-0">
                        <span>?“‚</span> PDF
                        <input type="file" class="hidden" accept=".pdf" onchange="handlePdfImport(this)">
                     </label>

                    <button onclick="saveRegGroup()" class="btn-ys shadow-md hover:brightness-110 !px-4 !py-1.5 !text-sm !h-auto !rounded shrink-0">
                        ?? ?±ë¡
                    </button>
                    
                    <button onclick="exitBuilderMode()" class="btn-ys !bg-slate-100 !text-slate-500 !border-slate-200 hover:bg-slate-200 hover:text-slate-700 shadow-none !px-3 !py-1.5 !text-sm !h-auto !rounded shrink-0">
                        ???˜ê?ê¸?
                    </button>
                </div>
            </div>
    
            <!-- Builder Body (Calc Height based on 60px header) -->
            <div style="display: flex; width: 100%; height: calc(100% - 60px); overflow: hidden; background-color: #f8fafc; position: relative;">
                
                <!-- [Left] Source Panel -->
                <div id="source-panel" class="hidden w-[35%] border-r border-slate-200 bg-white flex flex-col transition-all duration-300 ease-in-out relative z-10 h-full">
                    <div class="flex-none p-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-600 flex justify-between items-center">
                        <span>?“„ PDF Analyzed Text</span>
                        <button onclick="copySourceText()" class="text-blue-500 hover:text-blue-700">Copy All</button>
                    </div>
                    <textarea id="source-text-area" class="flex-1 w-full p-4 text-sm font-mono leading-relaxed outline-none resize-none bg-[#fdfdfd] text-slate-700" spellcheck="false" placeholder="PDF ë¶„ì„ ê²°ê³¼ê°€ ?¬ê¸°???œì‹œ?©ë‹ˆ??"></textarea>
                </div>

                <!-- [Right] Form Builder 3:6:1 Layout -->
                <div id="builder-main-area" class="flex-1 w-full relative px-6 pb-6 pt-3 h-full overflow-hidden">
                    <div class="h-full grid grid-cols-[3fr_5.5fr_1.5fr] gap-6">
                        
                        <!-- Zone A: Bundle (30%) -->
                        <div class="flex flex-col h-full overflow-hidden">
                            <!-- [Refine] Center Header: pt-3 (parent) vs mb-3 (here) = Balanced -->
                            <div class="mb-3 font-bold text-sm flex items-center gap-2 flex-none h-8">
                                <span class="text-[17px] text-[#013976]">?“¦ Bundles</span>
                                <span class="bg-gray-100 text-gray-600 text-[14px] font-bold px-2 py-0.5 rounded shadow-sm" id="count-bundle">ì´?0ê°?/span>
                            </div>
                            <!-- Added h-full and min-h-0 to force scrolling in flex child -->
                            <div id="zone-bundle" class="flex-1 min-h-0 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl p-4 space-y-4 scroll-smooth overflow-y-auto">
                                <!-- Bundle Cards Go Here -->
                                <div id="placeholder-bundle" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                    <span class="text-3xl mb-2">?“¦</span>
                                    <span class="text-[14px]">ì§€ë¬?ë¬¶ìŒ ì¶”ê?</span>
                                </div>
                            </div>
                        </div>

                        <!-- Zone B: Questions (60%) -->
                        <div class="flex flex-col h-full overflow-hidden">
                           <!-- [Refine] Center Header: pt-3 (parent) vs mb-3 (here) = Balanced -->
                           <div class="mb-3 font-bold text-sm flex items-center gap-2 flex-none h-8">
                                <span class="text-[17px] text-[#013976]">?“ Questions</span>
                                <div id="section-stats" class="flex items-center gap-2 ml-2 overflow-x-auto no-scrollbar"></div>
                            </div>
                            <!-- Added h-full and min-h-0 to force scrolling in flex child -->
                            <div id="zone-question" class="flex-1 min-h-0 bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-inner relative scroll-smooth overflow-y-auto">
                                <!-- Question Cards Go Here -->
                                <div id="placeholder-question" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                    <span class="text-3xl mb-2">?“</span>
                                    <span class="text-[14px]">ë¬¸í•­ ì¹´ë“œ ì¶”ê?</span>
                                </div>
                            </div>
                        </div>

                        <!-- Zone C: Navigator (10%) -->
                        <div class="flex flex-col h-full overflow-hidden">
                           <div class="mb-3 font-bold text-sm flex items-center gap-2 flex-none h-8">
                                <span class="text-[17px] text-[#013976]">?§­ Nav</span>
                            </div>
                            <!-- Added h-full and min-h-0 to force scrolling in flex child -->
                            <div id="zone-navigator" class="flex-1 min-h-0 bg-slate-100 border border-slate-200 rounded-xl p-2 space-y-2 scroll-smooth overflow-y-auto">
                                <!-- Navigator Items Go Here -->
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Palette Removed (Integrated into Header) -->
        </div>
    `;
}

// Split View Helpers
function toggleSplitView(forceState) {
    const panel = document.getElementById('source-panel');
    const btn = document.getElementById('btn-split-toggle');
    const isHidden = panel.classList.contains('hidden');

    if (forceState === true || (forceState === undefined && isHidden)) {
        panel.classList.remove('hidden');
        btn.classList.add('bg-indigo-50', 'text-indigo-600', 'border-indigo-200');
        btn.innerHTML = `<span>?“–</span> ?ë¬¸ ?¨ê¸°ê¸?;
    } else {
        panel.classList.add('hidden');
        btn.classList.remove('bg-indigo-50', 'text-indigo-600', 'border-indigo-200');
        btn.innerHTML = `<span>?“–</span> ?ë¬¸ ?€ì¡?;
    }
}

function copySourceText() {
    const text = document.getElementById('source-text-area').value;
    navigator.clipboard.writeText(text).then(() => showToast("?“‹ Copied to clipboard!"));
}

// Toast Notification Helper
// [Duplicate showToast removed - using robust version at line 242]

// --- Builder Helpers ---

function renderDraggableBtn(type, label, sub) {
    return `
        <div draggable="true" ondragstart="handleDragStart(event, '${type}')" onclick="addComponent('${type}')"
             class="group flex flex-col gap-0.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md cursor-grab active:cursor-grabbing transition-all select-none">
            <span class="font-bold text-slate-700 group-hover:text-blue-700 flex items-center gap-2">
                ${label}
            </span>
            <span class="text-[11px] text-slate-400 font-normal group-hover:text-blue-400">${sub}</span>
        </div>
    `;
}

let draggedType = null;

function handleDragStart(e, type) {
    draggedType = type;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', type);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const canvas = document.getElementById('reg-canvas');
    canvas.classList.add('bg-blue-50/30', 'border-blue-300');
}

function handleDragLeave(e) {
    const canvas = document.getElementById('reg-canvas');
    canvas.classList.remove('bg-blue-50/30', 'border-blue-300');
}

function handleDrop(e) {
    e.preventDefault();
    const canvas = document.getElementById('reg-canvas');
    canvas.classList.remove('bg-blue-50/30', 'border-blue-300');

    // Check valid type
    const type = e.dataTransfer.getData('text/plain') || draggedType;
    if (type) addComponent(type);

    draggedType = null;
}

// --- Palette Drag Logic ---
window.startDragPalette = function (e, el) {
    e.preventDefault();
    let startX = e.clientX;
    let startY = e.clientY;
    let startLeft = el.offsetLeft;
    let startTop = el.offsetTop;

    function onMouseMove(e) {
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        el.style.left = (startLeft + dx) + 'px';
        el.style.top = (startTop + dy) + 'px';
        el.style.right = 'auto'; // Clear right if set
        el.style.bottom = 'auto'; // Clear bottom if set
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

const GLOBAL_STATE = {
    components: [] // Store data model for sync
};

function addComponent(type, data = null) {
    const isBundle = type === 'bundle';
    const targetZoneId = isBundle ? 'zone-bundle' : 'zone-question';
    const placeholderId = isBundle ? 'placeholder-bundle' : 'placeholder-question';

    const zone = document.getElementById(targetZoneId);
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) placeholder.style.display = 'none';

    const id = data?.id || 'comp-' + Date.now() + Math.random().toString(36).substr(2, 5);
    const div = document.createElement('div');
    div.id = id;

    // UI: Card Styling
    div.className = 'builder-item bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all relative group';
    div.setAttribute('data-type', type);
    // [Disabled] Drag disabled for Zone A/B as requested
    // div.setAttribute('draggable', 'true');

    // Render Content
    div.innerHTML = getComponentHtml(type, id, data || {});

    // Delete Button
    // Delete Button Logic (Moved to clean header button)
    const delBtn = div.querySelector('.delete-comp-btn');
    if (delBtn) {
        delBtn.onclick = () => {
            if (!confirm("?•ë§ ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?")) return;

            // [Fix] Cleanup orphaned links if deleting a Bundle
            if (type === 'bundle') {
                const bundleId = div.id;
                const zoneB = document.getElementById('zone-question');
                if (zoneB) {
                    const linkedQuestions = Array.from(zoneB.querySelectorAll(`.builder-item[data-bundle-id="${bundleId}"]`));
                    linkedQuestions.forEach(q => {
                        q.removeAttribute('data-bundle-id');
                        q.removeAttribute('data-set-num');

                        // Remove Badge from Title
                        const badge = q.querySelector('.bundle-badge');
                        if (badge) badge.remove();
                    });
                }
            }

            div.remove();
            if (zone.children.length === 1) { // Only placeholder hidden
                if (placeholder) placeholder.style.display = 'flex';
            }
            updateQuestionNumbers();
        };
    }


    zone.appendChild(div);

    // [Fix v2] ?´ì¤‘ RAF: ì²?ë¡œë“œ ??flex ?ˆì´?„ì›ƒ???„ì „???•ì°©????scrollHeight ê³„ì‚°
    // ?¨ì¼ RAF???ˆì´?„ì›ƒ???„ì§ ë¯¸ì™„???íƒœ?????ˆì–´ ?’ì´ê°€ ë¶€?•í™•??
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            div.querySelectorAll('textarea').forEach(ta => autoResize(ta));
        });
    });

    // Initial Focus logic
    if (type === 'passage' || type === 'bundle') {
        // Focus logic
    }

    updateQuestionNumbers(); // This will trigger renderNavigator
}

// --- 3:6:1 Core Logic ---
function updateQuestionNumbers() {
    const zoneB = document.getElementById('zone-question');
    const zoneA = document.getElementById('zone-bundle');
    const zoneC = document.getElementById('zone-navigator');
    if (!zoneB || !zoneA) return;

    // 0. Use querySelectorAll to get ALL items in Zone B, including newly added ones
    // IMPORTANT: newly added element might not be in DOM if called synchronously after append? 
    // No, standard appendChild is synchronous. 
    const questions = Array.from(zoneB.querySelectorAll('.builder-item'));
    let qCount = 0;

    // 1. Assign Question Numbers (01, 02...)
    questions.forEach((q, idx) => {
        qCount++;
        const num = String(qCount).padStart(2, '0');
        q.setAttribute('data-q-num', num);

        // Update UI Label
        const label = q.querySelector('.q-number-label');
        if (label) label.textContent = `Q.${num}`;
    });

    // Update Counts
    // Update Counts
    // document.getElementById('count-question').textContent = qCount; // [Removed as redundant]

    // Update Bundle Count
    const bundleCount = zoneA.querySelectorAll('.builder-item').length;
    const bundleCountEl = document.getElementById('count-bundle');
    if (bundleCountEl) bundleCountEl.textContent = `ì´?${bundleCount}ê°?;

    // [New] Render Section Stats (Count & Score)
    const statsContainer = document.getElementById('section-stats');
    if (statsContainer) {
        // Calculate Stats
        const stats = {};
        questions.forEach(q => {
            const secInput = q.querySelector('[data-field="section"]');
            const scoreInput = q.querySelector('[data-field="score"]');

            let sec = secInput ? secInput.value : '';
            if (!sec) sec = 'ë¯¸ë¶„ë¥?;

            const score = scoreInput ? parseInt(scoreInput.value || 0) : 0;

            if (!stats[sec]) stats[sec] = { count: 0, score: 0 };
            stats[sec].count++;
            stats[sec].score += score;
        });

        // [New] Calculate Total
        let totalCount = 0;
        let totalScore = 0;
        Object.values(stats).forEach(s => {
            totalCount += s.count;
            totalScore += s.score;
        });

        // Render Badges
        const totalBadge = `
             <span class="bg-slate-700 text-white border border-slate-700 px-2 py-0.5 rounded text-[14px] font-bold whitespace-nowrap shadow-sm mr-2">
                 ì´?${totalCount}ê°?/ ${totalScore}??
             </span>
        `;

        // Order: Define preferred order or alphabetical?
        // Let's iterate keys.
        // Let's iterate keys.
        statsContainer.innerHTML = totalBadge + Object.keys(stats).map(sec => {
            if (sec === 'ë¯¸ë¶„ë¥? && stats[sec].count === 0) return '';
            // [Refine] Abbreviate Section: ?…í•´->[??, ë¬¸ë²•->[ë¬?
            const mapper = { 'Reading': 'R', 'Grammar': 'G', 'Vocabulary': 'V', 'Listening': 'L', 'Writing': 'W', 'ë¯¸ë¶„ë¥?: '?' };
            const shortSec = mapper[sec] || sec[0] || '?'; // fallback to first char if unknown

            return `
                <span class="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[14px] font-bold whitespace-nowrap shadow-sm">
                    [${shortSec}] ${stats[sec].count}ê°?/ ${stats[sec].score}??
                </span>
            `;
        }).join('');
    }

    // 2. Render Navigator (Zone C)
    if (zoneC) {
        renderNavigator(questions);
    }

    // 3. Bi-directional Bundle Sync
    syncBundles(questions);
}

function renderNavigator(questions) {
    let zoneC = document.getElementById('zone-navigator');
    if (!zoneC) {
        // Fallback: If for some reason global replacement failed, try to find it within builder-main-area
        console.warn("Zone C not found by ID, searching deeper...");
        zoneC = document.querySelector('#builder-main-area #zone-navigator');
        if (!zoneC) return;
    }
    zoneC.innerHTML = '';

    if (questions.length === 0) {
        zoneC.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <span class="text-3xl mb-2">?§­</span>
                <span class="text-[14px]">ë¬¸í•­ ì¹´ë“œ ì¶”ê?</span>
            </div>
        `;
        return;
    }

    // zoneC.style.border = "2px solid red"; // DEBUG (Removed)

    questions.forEach(q => {
        const id = q.id;
        const num = q.getAttribute('data-q-num');
        const type = q.getAttribute('data-type');

        // [Custom Label Logic]
        const typeLabel = type === 'obj' ? 'ê°? : 'ì£?;
        const typeColor = type === 'obj' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600';

        // Retrieve Section & Score
        // Since 'q' is the DOM element, we query inputs
        const secInput = q.querySelector('[data-field="section"]');
        const scoreInput = q.querySelector('[data-field="score"]');
        const secVal = secInput ? secInput.value : '';
        const scoreVal = scoreInput ? scoreInput.value : '';
        const shortSec = secVal ? secVal[0] : ''; // '??, 'ë¬? ...

        // Check Linked Bundle
        const linkedBundleId = q.getAttribute('data-bundle-id');

        const navItem = document.createElement('div');
        navItem.className = 'bg-white border border-slate-200 rounded p-1.5 text-[13px] flex items-center justify-between cursor-move hover:border-blue-400 select-none shadow-sm gap-2';
        navItem.setAttribute('draggable', 'true');
        navItem.setAttribute('data-target-id', id); // Link back to Zone B item

        // Layout: [Num] [Type] [Sec] [Score] [SetBadge]
        navItem.innerHTML = `
            <div class="flex items-center gap-1.5 overflow-hidden">
                <span class="font-bold text-slate-700 w-5 text-center shrink-0 text-[14px]">${num}</span>
                <div class="flex items-center gap-1 shrink-0">
                    <span class="${typeColor} px-1 rounded text-[14px] font-bold min-w-[20px] text-center">${typeLabel}</span>
                    ${shortSec ? `<span class="bg-slate-100 text-slate-600 px-1 rounded text-[14px] font-bold min-w-[20px] text-center">${shortSec}</span>` : ''}
                    ${scoreVal ? `<span class="bg-yellow-50 text-yellow-700 border border-yellow-100 px-1 rounded text-[14px] font-bold min-w-[20px] text-center">${scoreVal}</span>` : ''}
                </div>
            </div>
            ${linkedBundleId ? `<span class="text-[14px] font-bold set-badge shrink-0 ml-auto">#Set</span>` : ''} 
        `;
        // Note: #Set number will be populated by syncBundles via direct DOM manipulation or we rely on re-render?
        // Actually syncBundles calls renderNavigator? No, updateQuestionNumbers calls renderNavigator THEN syncBundles.
        // So syncBundles needs to update Nav items too? Or we store data-set-num BEFORE renderNavigator.

        // Better: Let syncBundles update the DOM of existing Nav items? 
        // Or updateQuestionNumbers stores the set-num on Q items first?
        // But Q items don't know their set number until syncBundles runs (which iterates bundles).

        // Revised flow: syncBundles should Run First? No, bundles depend on Q IDs?
        // Let's modify syncBundles to ALSO update the Navigator Items' set badges.

        // Nav Drag Events
        navItem.addEventListener('dragstart', handleNavDragStart);
        navItem.addEventListener('dragover', handleNavDragOver);
        navItem.addEventListener('drop', handleNavDrop);
        navItem.addEventListener('dragend', handleNavDragEnd);

        // [New] Nav Click ??Scroll to Question in Zone B
        navItem.addEventListener('click', () => {
            const targetId = navItem.getAttribute('data-target-id');
            const targetEl = document.getElementById(targetId);
            const zoneQ = document.getElementById('zone-question');
            if (targetEl && zoneQ) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // ?˜ì´?¼ì´???¨ê³¼
                targetEl.style.outline = '2px solid #3b82f6';
                targetEl.style.borderRadius = '12px';
                setTimeout(() => { targetEl.style.outline = ''; }, 1200);
            }
        });

        zoneC.appendChild(navItem);
    });
}

// --- Sync Logic ---

// --- Sync Logic ---

// [New] Distinct Color Palette for Sets (23 variations)
const SET_COLOR_PALETTE = [
    'text-red-600 bg-red-100', 'text-amber-600 bg-amber-100', 'text-lime-600 bg-lime-100',
    'text-emerald-600 bg-emerald-100', 'text-teal-600 bg-teal-100', 'text-cyan-600 bg-cyan-100',
    'text-sky-600 bg-sky-100', 'text-blue-600 bg-blue-100', 'text-indigo-600 bg-indigo-100',
    'text-violet-600 bg-violet-100', 'text-purple-600 bg-purple-100', 'text-fuchsia-600 bg-fuchsia-100',
    'text-pink-600 bg-pink-100', 'text-rose-600 bg-rose-100',
    'text-red-700 bg-red-200', 'text-green-700 bg-green-200', 'text-blue-700 bg-blue-200',
    'text-orange-700 bg-orange-200', 'text-purple-700 bg-purple-200', 'text-cyan-700 bg-cyan-200',
    'text-slate-600 bg-slate-200', 'text-stone-600 bg-stone-200', 'text-zinc-600 bg-zinc-200'
];

function syncBundles(questions) {
    const zoneA = document.getElementById('zone-bundle');
    const bundles = Array.from(zoneA.querySelectorAll('.builder-item'));

    // Map: Q_ID -> Q_Number (e.g. 'comp-123' -> '01')
    const idToNumMap = {};
    questions.forEach(q => {
        idToNumMap[q.id] = parseInt(q.getAttribute('data-q-num'));
    });

    bundles.forEach((bundle, idx) => {
        const input = document.getElementById(`${bundle.id}-link-input`);
        const setNum = idx + 1;

        // Pick Color (Cycle through palette)
        const colorClass = SET_COLOR_PALETTE[idx % SET_COLOR_PALETTE.length];

        // Read stored links first to check if badge should be shown
        let linkedIds = [];
        try {
            linkedIds = JSON.parse(bundle.getAttribute('data-linked-ids') || '[]');
        } catch (e) {
            linkedIds = [];
        }

        // [Refine] Update Bundle Card Title
        const bundleTitleH4 = bundle.querySelector('h4');
        if (bundleTitleH4) {
            let setBadge = bundleTitleH4.querySelector('.bundle-set-num');

            // Only show #Set if linked
            if (linkedIds.length > 0) {
                if (!setBadge) {
                    setBadge = document.createElement('span');
                    bundleTitleH4.appendChild(setBadge);
                }
                setBadge.className = `bundle-set-num ml-2 px-1.5 py-0.5 rounded-md font-bold text-[14px] ${colorClass}`;
                setBadge.innerText = `#Set ${setNum}`;
            } else {
                if (setBadge) setBadge.remove();
            }
        }


        if (linkedIds.length > 0) {
            // Find current numbers for these IDs
            const currentNums = linkedIds
                .map(id => idToNumMap[id])
                .filter(n => !isNaN(n))
                .sort((a, b) => a - b);

            // Auto-update Input
            if (input) {
                // Only update if focused to avoid fighting typing?
                // Or update always for "Bi-directional" truth.
                // We update it. Sync is truth.
                input.value = currentNums.join(', ');
            }

            // Update Zone B Badges (Visual Feedback)
            linkedIds.forEach(qId => {
                const qEl = document.getElementById(qId);
                if (qEl) {
                    qEl.setAttribute('data-bundle-id', bundle.id);
                    qEl.setAttribute('data-set-num', setNum); // Store for ref

                    // Ensure badge exists in Title
                    const header = qEl.querySelector('div.flex.items-center.gap-3');
                    if (header) { // The header containing Icon & Title
                        // Check if badge exists
                        let badge = header.querySelector('.bundle-badge');
                        if (!badge) {
                            badge = document.createElement('span');
                            // Insert after H4
                            const h4 = header.querySelector('h4');
                            if (h4) {
                                h4.appendChild(badge);
                            }
                        }
                        badge.innerText = `#Set ${setNum}`;
                        badge.className = `bundle-badge text-[14px] px-1.5 py-0.5 rounded-md font-bold ml-2 ${colorClass}`; // Dynamic Color
                    }

                    // [New] Update Navigator Badges (Zone C)
                    // We find the nav item by data-target-id
                    const zoneC = document.getElementById('zone-navigator');
                    if (zoneC) {
                        const navItem = zoneC.querySelector(`[data-target-id="${qId}"]`);
                        if (navItem) {
                            let navBadge = navItem.querySelector('.set-badge');
                            if (!navBadge) {
                                // Create if missing (e.g. if renderNavigator didn't make it)
                                navBadge = document.createElement('span');
                                navItem.appendChild(navBadge);
                            }
                            navBadge.innerText = `#Set ${setNum}`;
                            navBadge.className = `set-badge text-[14px] px-1 rounded font-bold ml-auto ${colorClass}`; // Apply same color scheme
                        }
                    }
                }
            });
        }
    });
}

// --- Nav Drag Handlers ---
let navDragSrc = null;

function handleNavDragStart(e) {
    navDragSrc = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-target-id'));
    this.classList.add('opacity-50', 'bg-blue-50');
}

function handleNavDragOver(e) {
    e.preventDefault();
    return false;
}

function handleNavDrop(e) {
    e.stopPropagation();
    if (navDragSrc !== this) {
        const container = this.parentNode;
        const allItems = Array.from(container.children);

        // 1. Identify Source & Target Context
        const srcId = navDragSrc.getAttribute('data-target-id');
        const tgtId = this.getAttribute('data-target-id');

        const srcQ = document.getElementById(srcId);
        const tgtQ = document.getElementById(tgtId);

        const srcBundleId = srcQ ? srcQ.getAttribute('data-bundle-id') : null;
        const tgtBundleId = tgtQ ? tgtQ.getAttribute('data-bundle-id') : null;

        // 2. Identify Moving Block (Source)
        let movingItems = [navDragSrc];
        if (srcBundleId) {
            // If dragging item is part of a bundle, move ALL items of that bundle
            movingItems = allItems.filter(item => {
                const qId = item.getAttribute('data-target-id');
                const q = document.getElementById(qId);
                return q && q.getAttribute('data-bundle-id') === srcBundleId;
            });
        }

        // 3. Identify Reference Block (Target)
        // We need to decide insertion point: Before First or After Last of Target Group
        // Base decision on: Is the *first item* of Moving Group above or below the Target?
        // Or simpler: Compare index of navDragSrc vs this.

        const srcIndex = allItems.indexOf(navDragSrc);
        const tgtIndex = allItems.indexOf(this);
        const isMovingDown = srcIndex < tgtIndex;

        // Find Target Anchor
        let anchorItem = this;

        if (tgtBundleId) {
            const tgtGroupItems = allItems.filter(item => {
                const qId = item.getAttribute('data-target-id');
                const q = document.getElementById(qId);
                return q && q.getAttribute('data-bundle-id') === tgtBundleId;
            });

            // If conflict: attempting to drop INSIDE a different bundle?
            // Rule: Escape the bundle.
            // If moving down, anchor is the LAST item of target bundle.
            // If moving up, anchor is the FIRST item of target bundle.

            if (isMovingDown) {
                anchorItem = tgtGroupItems[tgtGroupItems.length - 1]; // Insert after this
            } else {
                anchorItem = tgtGroupItems[0]; // Insert before this
            }
        }

        // 4. Perform Move
        // We move all movingItems sequentially
        movingItems.forEach(item => {
            if (isMovingDown) {
                // Insert After Anchor
                // Careful: as we append, the anchor position might shift if we use nextSibling? 
                // Actually, insertBefore(item, anchor.nextSibling) works.
                // We update anchor to be the just-moved item to maintain order of moving block?
                // Yes, if moving a block A,B,C after D:
                // Move A after D. Anchor becomes A.
                // Move B after A. Anchor becomes B.
                container.insertBefore(item, anchorItem.nextSibling);
                anchorItem = item;
            } else {
                // Insert Before Anchor
                // Move A,B,C before D:
                // Move A before D.
                // Move B before D (Wait, B should be after A?).
                // No, we iterate movingItems (A, B, C).
                // Insert A before D.
                // Insert B before D? No, that reverses order (B, A, C -> D).
                // We should keep the block order.
                // So we insert A before D. Then we need to insert B after A?
                // Or just insert the whole block at the target index?
                container.insertBefore(item, anchorItem);
                // No, for "Before", we don't update anchor if we just keep inserting before the original Anchor. 
                // EXCEPT if movingItems includes the anchor itself (impossible usually).
            }
        });

        // Sync Zone B
        syncZoneBOrder(container);
    }
    return false;
}

function handleNavDragEnd(e) {
    this.classList.remove('opacity-50', 'bg-blue-50');
    // Finalize numbers
    updateQuestionNumbers();
}

function syncZoneBOrder(navContainer) {
    const zoneB = document.getElementById('zone-question');
    const navItems = Array.from(navContainer.children);

    // Re-append Zone B items in the order of Nav Items
    navItems.forEach(nav => {
        const targetId = nav.getAttribute('data-target-id');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            zoneB.appendChild(targetEl); // Moves it to the end, effectively sorting
        }
    });
}

// --- Re-Numbering Logic ---
// [Legacy updateQuestionNumbers removed to prevent conflict]

// [Fix #3] All Font Sizes to 14px (text-sm, fs-14)
// [Robust Fix] getComponentHtml with data-field attributes
function getComponentHtml(type, id, data) {
    const d = data || {};
    const inputClass = "w-full p-2.5 text-[14px] font-medium border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-all";

    switch (type) {
        case 'cat':
            return `<input type="hidden" id="${id}-val" data-field="catId" value="${d.catId || ''}">
                    <!-- Legacy UI for cat if needed, but usually hidden or handled by top bar -->`;

        case 'bundle':
            const isEditMode = !!document.querySelector('[data-canvas-id="07-2"]');
            return `
                <div class="flex items-center justify-between gap-3 mb-4 bg-orange-50 p-3 rounded-xl border border-orange-100" data-group-id="${d.groupId || generateUUID()}">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">?“¦</span>
                        <div>
                            <h4 class="font-bold text-orange-800 text-[15px]">Group Bundle</h4>
                        </div>
                    </div>
                    <button class="delete-comp-btn p-1 w-[28px] h-[28px] flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors font-bold text-[15px]" title="?? œ" ${isEditMode ? 'style="display:none;"' : ''}>??/button>
                </div>
                <div class="mb-4">
                    <label class="text-[14px] font-bold text-slate-600 mb-1.5 block">ì§ˆë¬¸ ?´ìš© (Question)</label>
                    <textarea id="${id}-title" data-field="title" rows="1" oninput="autoResize(this)" class="${inputClass} resize-none overflow-hidden" placeholder="ì§ˆë¬¸???…ë ¥?˜ì„¸??>${d.title || d.text || ''}</textarea>
                </div>
                <!-- ?°ê²° ë¬¸í•­ ê´€???ì—­?€ ?˜ì • ëª¨ë“œê°€ ?„ë‹ ?Œë§Œ ?œì‹œ (?˜ì • ëª¨ë“œ?ì„œ???ˆë¼ ë³€ê²?ê¸ˆì?) -->
                <div class="mb-4" ${isEditMode ? 'style="display:none;"' : ''}>
                     <label class="text-[14px] font-bold text-slate-600 mb-1.5 block">?°ê²° ë¬¸í•­ (Linked Questions)</label>
                     <div class="flex items-center gap-2 overflow-hidden">
                        <input type="text" id="${id}-link-input" 
                                class="flex-1 min-w-0 p-2 text-[14px] font-bold text-orange-600 border-2 border-orange-200 rounded-lg outline-none focus:border-orange-400 placeholder:text-orange-300 placeholder:font-normal" 
                                placeholder="?? 1, 2, 3 (ë²ˆí˜¸ ?…ë ¥)"
                                onkeydown="if(event.key==='Enter'){ event.preventDefault(); handleBundleLinkInput('${id}', this.value); }"
                                value="">
                        <div class="flex flex-row gap-1 flex-shrink-0">
                            <button onclick="handleBundleLinkInput('${id}', document.getElementById('${id}-link-input').value)" 
                                    class="btn-ys !bg-orange-600 !text-white !border-orange-600 hover:brightness-110 !px-3 !py-1 !text-[13px] !font-bold rounded shadow-sm whitespace-nowrap">
                                ?°ê²°
                            </button>
                            <button onclick="handleBundleDisconnect('${id}')" 
                                    class="btn-ys !bg-white !text-red-500 !border-red-200 hover:bg-red-50 !px-3 !py-1 !text-[13px] !font-bold rounded shadow-sm whitespace-nowrap">
                                ?´ì œ
                            </button>
                        </div>
                     </div>
                     <!-- Value will be populated by sync logic if data-linked-ids exists -->
                </div>
                
                <!-- Toggle Controls -->
                <div class="flex items-center gap-3 mb-4">
                    <button onclick="document.getElementById('${id}-ctx-box').classList.toggle('hidden')" class="text-[14px] font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1.5 py-1 px-2 hover:bg-orange-50 rounded-lg transition-colors">
                        <span>??/span> ì§€ë¬?ì¶”ê?
                    </button>
                    <button onclick="document.getElementById('${id}-img-box').classList.toggle('hidden')" class="text-[14px] font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1.5 py-1 px-2 hover:bg-orange-50 rounded-lg transition-colors">
                        <span>?“·</span> ?´ë?ì§€ ì¶”ê?
                    </button>
                </div>

                <!-- Context (Hidden by default) -->
                <div id="${id}-ctx-box" class="mb-4 ${d.html ? '' : 'hidden'}">
                     <div class="flex justify-between items-center mb-1.5">
                        <label class="text-[14px] font-bold text-slate-600">ì§€ë¬??´ìš©</label>
                        ${renderMiniToolbar(id + '-editor')}
                     </div>
                     <div id="${id}-editor" data-field="html" class="min-h-[40px] p-2 border border-slate-200 rounded-xl outline-none text-[14px] leading-relaxed focus:border-orange-300 transition-colors bg-white shadow-inner" contenteditable="true">
                        ${d.html || ''}
                     </div>
                </div>
                <!-- Image (Hidden by default) -->
                <!-- Image (Hidden by default) -->
                <div id="${id}-img-box" class="mb-4 ${d.imgUrl ? '' : 'hidden'}">
                     ${renderImageUploader(id, d)}
                </div>

                <!-- Nested Zone -->
                <!-- Nested Zone Removed -->
             `;

        case 'obj':
        case 'subj':
            const isObj = type === 'obj';
            const icon = isObj ? '?? : '?ï¸';
            const typeName = isObj ? 'ê°ê???(Choice)' : 'ì£¼ê???(Essay)';
            const headerBg = isObj ? 'bg-blue-50' : 'bg-rose-50';
            const borderColor = isObj ? 'border-blue-100' : 'border-rose-100';
            const optCount = (d.options && d.options.length >= 2 && d.options.length <= 5) ? d.options.length : 5;
            const optArr = Array.from({ length: optCount }, (_, i) => i + 1);

            return `
                 <div class="flex items-center justify-between mb-4 ${headerBg} p-3 rounded-xl border ${borderColor}" data-bundle-id="${d.linkedGroupId || ''}">
                    <!-- Left: Icon & Q.ë²ˆí˜¸ -->
                    <div class="flex items-center gap-3 min-w-0">
                        <span class="text-2xl flex-shrink-0">${icon}</span>
                        <h4 class="font-bold text-slate-800 text-[15px] flex items-center gap-2 whitespace-nowrap">
                            <span class="q-number-label bg-[#013976] text-white px-2 py-0.5 rounded-lg shadow-sm" style="font-size: 17px;">Q.</span>
                        </h4>
                    </div>

                    <!-- Right: Compact Controls (Single Line) -->
                    <div class="flex items-center gap-2 flex-shrink-0">
                         <!-- Section -->
                         <select id="${id}-sec" data-field="section" 
                                 onchange="updateSubTypes('${id}', this.value); updateQuestionNumbers(); this.classList.toggle('bg-amber-50', !this.value); this.classList.toggle('bg-white', !!this.value);" 
                                 class="h-[34px] px-1 text-[13px] font-bold border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-rose-700 ${!d.sec ? 'bg-amber-50' : 'bg-white'}">
                            <option value="" disabled ${!d.sec ? 'selected' : ''}>?ì—­</option>
                            <option value="Reading" ${d.sec === 'Reading' ? 'selected' : ''}>Reading</option>
                            <option value="Grammar" ${d.sec === 'Grammar' ? 'selected' : ''}>Grammar</option>
                            <option value="Vocabulary" ${d.sec === 'Vocabulary' ? 'selected' : ''}>Vocabulary</option>
                            <option value="Listening" ${d.sec === 'Listening' ? 'selected' : ''}>Listening</option>
                            <option value="Writing" ${d.sec === 'Writing' ? 'selected' : ''}>Writing</option>
                         </select>

                         <!-- SubType -->
                         <select id="${id}-subtype" data-field="subtype" 
                                 onchange="this.classList.toggle('bg-amber-50', !this.value); this.classList.toggle('bg-white', !!this.value);"
                                 class="h-[34px] px-1 text-[13px] font-bold border border-slate-300 rounded-lg outline-none focus:border-blue-500 ${!d.sub ? 'bg-amber-50' : 'bg-white'}">
                             ${renderSubTypeOptions(d.sec, d.sub)}
                         </select>

                         <!-- Difficulty -->
                         <select id="${id}-diff" data-field="difficulty" class="h-[34px] px-2 text-[13px] border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white cursor-pointer">
                             ${['ìµœìƒ', '??, 'ì¤?, '??, 'ê¸°ì´ˆ'].map(lvl => `
                                <option value="${lvl}" ${(d.diff === lvl || (!d.diff && lvl === 'ì¤?)) ? 'selected' : ''}>${lvl}</option>
                             `).join('')}
                         </select>

                         <!-- Score -->
                         <div class="flex items-center gap-1 h-[34px]">
                            <span class="text-[13px] font-bold text-slate-500">ë°°ì </span>
                            <input type="number" id="${id}-score" data-field="score" value="${d.score ?? 0}" min="0" max="99" oninput="if(this.value>99) this.value=99; if(this.value<0) this.value=0; updateQuestionNumbers();" class="w-[40px] h-full text-center text-[14px] font-bold border border-slate-300 rounded-lg outline-none focus:border-blue-500" placeholder="0">
                         </div>
                         <!-- Delete Button (X) -->
                         <button class="delete-comp-btn p-1 w-[28px] h-[28px] flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors font-bold text-[15px]" title="?? œ">??/button>
                    </div>
                 </div>

                 
                 <!-- Question Content -->
                 <div class="space-y-4">
                     <div>
                        <label class="text-[14px] font-bold text-slate-600 mb-1.5 block">ì§ˆë¬¸ ?´ìš© (Question)</label>
                        <textarea id="${id}-text" data-field="text" rows="1" oninput="autoResize(this)" class="${inputClass} resize-none overflow-hidden" placeholder="ì§ˆë¬¸???…ë ¥?˜ì„¸??>${d.text || d.title || ''}</textarea>
                     </div>

                     <!-- Toggles -->
                     <div class="flex items-center gap-3">
                        <button onclick="document.getElementById('${id}-inner-ctx').classList.toggle('hidden')" class="text-[14px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 py-1 px-2 hover:bg-blue-50 rounded-lg transition-colors">
                            <span>??/span> ì§€ë¬?ì¶”ê?
                        </button>
                        <button onclick="document.getElementById('${id}-img-u').classList.toggle('hidden')" class="text-[14px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 py-1 px-2 hover:bg-blue-50 rounded-lg transition-colors">
                            <span>?“·</span> ?´ë?ì§€ ì¶”ê?
                        </button>
                     </div>

                     <!-- Inner Context (Hidden) -->
                     <div id="${id}-inner-ctx" class="${d.innerPassage ? '' : 'hidden'}">
                        <div class="flex justify-between items-center mb-1.5">
                            <label class="text-[14px] font-bold text-slate-600">ì§€ë¬??´ìš©</label>
                            ${renderMiniToolbar(id + '-inner-ctx-editor')}
                        </div>
                        <div id="${id}-inner-ctx-editor" data-field="innerPassage" class="min-h-[40px] p-2 border border-slate-200 rounded-xl outline-none text-[14px] leading-relaxed focus:border-blue-300 transition-colors bg-white shadow-inner" contenteditable="true">
                            ${d.innerPassage || ''}
                        </div>
                     </div>

                     <!-- Image (Hidden) -->
                     <div id="${id}-img-u" class="${d.imgUrl ? '' : 'hidden'} mt-2">
                          ${renderImageUploader(id, d)} 
                     </div>
                 </div>

                 <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-4">
                    ${isObj
                    ? `<div class="flex justify-between items-center mb-3">
                               <label class="text-[14px] font-bold text-slate-700">ë³´ê¸° ë°??•ë‹µ</label>
                               <select onchange="renderBuilderChoices('${id}', this.value)" class="p-1 px-2 text-[14px] border border-slate-300 rounded-lg outline-none focus:border-blue-500">
                                    <option value="2" ${optCount === 2 ? 'selected' : ''}>2ê°?/option>
                                    <option value="3" ${optCount === 3 ? 'selected' : ''}>3ê°?/option>
                                    <option value="4" ${optCount === 4 ? 'selected' : ''}>4ê°?/option>
                                    <option value="5" ${optCount === 5 ? 'selected' : ''}>5ê°?/option>
                               </select>
                           </div>
                           <div id="${id}-choices" class="grid grid-cols-2 gap-2 mb-4">
                                ${optArr.map(n => `
                                    <div class="flex items-center gap-2 group">
                                       <span class="text-[14px] w-4">${n}.</span>
                                       <textarea id="${id}-choice-${n}" data-field="choice" data-index="${n}" rows="1" oninput="autoResize(this)"
                                              class="flex-1 p-2 text-[14px] bg-slate-50 border border-slate-200 rounded-lg overflow-hidden resize-none" style="min-height: 40px;">${(d.options && d.options[n - 1]) || ''}</textarea>
                                    </div>
                                 `).join('')}
                           </div>
                           <div class="flex items-center gap-3">
                               <label class="text-[14px] font-bold text-blue-600">?•ë‹µ ë²ˆí˜¸:</label>
                               <input type="number" id="${id}-answer" data-field="answer" value="${d.answer || ''}" class="w-20 p-2 text-center text-[14px] font-bold border border-blue-200 rounded-lg">
                           </div>
`
                    : `<label class="text-[14px] font-bold text-slate-700 mb-2 block">?•ë‹µ (ì±„ì ???µì‹¬ ?¤ì›Œ??</label>
                           <textarea id="${id}-answer" data-field="answer" rows="1" oninput="autoResize(this)" class="${inputClass} overflow-hidden resize-none mb-4" style="min-height: 42px;" placeholder="?¤ì›Œ???•ë‹µ???…ë ¥?˜ì„¸??">${d.answer || ''}</textarea>
                       <label class="text-[14px] font-bold text-slate-700 mb-2 block">ëª¨ë²” ?µì•ˆ (?œìˆ ???„ì²´ ?€??</label>
                           <textarea id="${id}-modelAnswer" data-field="modelAnswer" rows="1" oninput="autoResize(this)" class="${inputClass} overflow-hidden resize-none" style="min-height: 42px;" placeholder="?ì„¸ ?€??ë°?ëª¨ë²” ?µì•ˆ???…ë ¥?˜ì„¸??">${d.modelAnswer || ''}</textarea>`
                }
                 </div>
            `;

        default: return '';
    }
}

// [Robust Fix] Helper for Image Uploader to include data-field (if accessed via querySelector)
// But wait, renderImageUploader is inside getComponentHtml mostly.
// We should update it too.

// --- Revised Serialization Logic using data-fields ---

function serializeBuilderState() {
    console.group("serializeBuilderState Debug");
    const blocks = document.querySelectorAll('.builder-item');
    const state = [];

    blocks.forEach(block => {
        const type = block.getAttribute('data-type');
        const id = block.id;
        let val = {};

        try {
            if (type === 'cat') {
                val = { catId: block.querySelector('[data-field="catId"]')?.value || '' };
            } else if (type === 'bundle' || type === 'passage') {
                val = {
                    title: block.querySelector('[data-field="title"]')?.value || '',
                    html: stripTwStyles(block.querySelector('[data-field="html"]')?.innerHTML || '')
                };
            } else if (type === 'obj' || type === 'subj') {
                val = {
                    sec: block.querySelector('[data-field="section"]')?.value || 'Reading',
                    sub: block.querySelector('[data-field="subtype"]')?.value || 'ê¸°í?', // SubType Fixed
                    diff: block.querySelector('[data-field="difficulty"]')?.value || 'ì¤?,
                    score: block.querySelector('[data-field="score"]')?.value || 3,
                    text: block.querySelector('[data-field="text"]')?.value || '', // Storing as 'text' directly
                    answer: block.querySelector('[data-field="answer"]')?.value || '',
                    modelAnswer: block.querySelector('[data-field="modelAnswer"]')?.value || '', // Collect Model Answer
                    options: []
                };

                if (type === 'obj') {
                    // Query all choices in order
                    const choices = block.querySelectorAll('[data-field="choice"]');
                    choices.forEach(ch => val.options.push(ch.value));
                }
            }
            // Log found data
            console.log(`Block[${type}]ID: ${id} `, val);
            if (!val.text && (type === 'obj' || type === 'subj')) console.warn(`? ï¸ Empty text for question ${id}`);

            state.push({ type, data: val });
        } catch (e) {
            console.error("Serialize Error on block", id, e);
        }
    });
    console.groupEnd();
    return state;
}



// Helpers for Component Rendering
function renderBuilderChoices(itemId, n) {
    const container = document.getElementById(itemId + '-choices');
    if (!container) return;

    let html = '';
    for (let i = 1; i <= n; i++) {
        const inputId = `${itemId}-choice-${i}`;
        const existing = document.getElementById(inputId);
        const val = existing ? existing.value : '';

        html += `
                <div class="flex items-center gap-2 group">
                <span class="text-[14px] text-slate-400 font-bold w-4 group-hover:text-blue-500 transition-colors">${i}.</span>
                <textarea id="${inputId}" data-field="choice" data-index="${i}" rows="1" oninput="autoResize(this)"
                       class="flex-1 p-2 text-[14px] bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition-all overflow-hidden resize-none" style="min-height: 40px;">${val}</textarea>
             </div>
                `;
    }
    container.innerHTML = html;
}
function renderMiniToolbar(targetId) {
    return `
                <div class="flex gap-1 flex-wrap" onmousedown="event.preventDefault()">
             <button onclick="execCmd('bold')" class="p-1 hover:bg-slate-200 rounded text-[14px] font-bold w-6 h-6 flex items-center justify-center">B</button>
             <button onclick="execCmd('underline')" class="p-1 hover:bg-slate-200 rounded text-[14px] underline w-6 h-6 flex items-center justify-center">U</button>
             <div class="w-px h-4 bg-slate-300 mx-1 self-center"></div>
             <button onclick="insertSymbol('??)" class="p-1 hover:bg-slate-200 rounded text-[14px] w-6 h-6 flex items-center justify-center">??/button>
             <button onclick="insertSymbol('??)" class="p-1 hover:bg-slate-200 rounded text-[14px] w-6 h-6 flex items-center justify-center">??/button>
             <button onclick="insertSymbol('??)" class="p-1 hover:bg-slate-200 rounded text-[14px] w-6 h-6 flex items-center justify-center">??/button>
             <div class="w-px h-4 bg-slate-300 mx-1 self-center"></div>
             <button onclick="insertSymbol('??)" class="p-1 hover:bg-slate-200 rounded text-[14px] w-6 h-6 flex items-center justify-center">??/button>
             <button onclick="insertSymbol('??)" class="p-1 hover:bg-slate-200 rounded text-[14px] w-6 h-6 flex items-center justify-center">??/button>
             <button onclick="insertSymbol('??)" class="p-1 hover:bg-slate-200 rounded text-[14px] w-6 h-6 flex items-center justify-center">??/button>
             <button onclick="insertSymbol('??)" class="p-1 hover:bg-slate-200 rounded text-[14px] w-6 h-6 flex items-center justify-center">??/button>
             <button onclick="insertSymbol('??)" class="p-1 hover:bg-slate-200 rounded text-[14px] w-6 h-6 flex items-center justify-center">??/button>
        </div>
                `;
}

function renderSubTypeOptions(section, selected) {
    const list = SUB_TYPE_MAP[section] || [];
    let html = `<option value="" disabled ${!selected ? 'selected' : ''}>?¸ë??ì—­</option>`;
    if (list.length === 0 && !section) return html; // Return just default if no section
    return html + (list.length ? list : ["ê¸°í?"]).map(item => `<option value="${item}" ${item === selected ? 'selected' : ''}>${item}</option>`).join('');
}

function handleBundleLinkInput(bundleId, value) {
    const zoneB = document.getElementById('zone-question');
    const questions = Array.from(zoneB.querySelectorAll('.builder-item'));

    // Parse input "1, 2, 3" -> [1, 2, 3]
    const targetNums = value.split(',').map(s => s.trim()).filter(s => /^\d+$/.test(s)).map(Number);

    // [New] Conflict Validation & Invalid ID Check
    let validCount = 0;
    for (const num of targetNums) {
        if (num > 0 && num <= questions.length) {
            validCount++;
            const q = questions[num - 1]; // 0-based
            const existingBundleId = q.getAttribute('data-bundle-id');
            // If linked to a DIFFERENT bundle
            if (existingBundleId && existingBundleId !== bundleId) {
                alert("?´ë? ?°ê²°??ë¬¶ìŒì¹´ë“œê°€ ?ˆìŠµ?ˆë‹¤.");
                return; // Abort entirely
            }
        }
    }

    if (validCount === 0 && targetNums.length > 0) {
        alert("ë¬¸í•­???†ìŠµ?ˆë‹¤.");
        return;
    }

    const linkedIds = [];

    // Reset previous links for this bundle
    questions.forEach(q => {
        if (q.getAttribute('data-bundle-id') === bundleId) {
            q.removeAttribute('data-bundle-id');
            // Remove Badge
            const titleH4 = q.querySelector('h4');
            if (titleH4) {
                const badge = titleH4.querySelector('.linked-badge');
                if (badge) badge.remove();
            }
        }
    });

    // Link new targets
    targetNums.forEach(num => {
        // Find question with this number (1-based index)
        if (num > 0 && num <= questions.length) {
            const targetQ = questions[num - 1]; // num is 1-based, index is 0-based
            if (targetQ) {
                targetQ.setAttribute('data-bundle-id', bundleId);
                linkedIds.push(targetQ.id);
            }
        }
    });

    // Store state on Bundle Element
    const bundleEl = document.getElementById(bundleId);
    if (bundleEl) {
        bundleEl.setAttribute('data-linked-ids', JSON.stringify(linkedIds));
    }

    // Trigger Update to Refresh UI (Nav, counts, link badges)
    updateQuestionNumbers();
}

// [New] Handle Disconnect
function handleBundleDisconnect(bundleId) {
    if (!confirm("??ë¬¶ìŒ???°ê²°??ëª¨ë“  ë¬¸í•­???°ê²°???´ì œ?˜ì‹œê² ìŠµ?ˆê¹Œ?")) return;

    const zoneB = document.getElementById('zone-question');
    const questions = Array.from(zoneB.querySelectorAll('.builder-item'));

    questions.forEach(q => {
        if (q.getAttribute('data-bundle-id') === bundleId) {
            q.removeAttribute('data-bundle-id');
            q.removeAttribute('data-set-num'); // Clear set num ref
            // Remove Badge from Title
            const header = q.querySelector('div.flex.items-center.gap-3');
            if (header) {
                const badge = header.querySelector('.bundle-badge');
                if (badge) badge.remove();
            }
        }
    });

    // Clear Bundle Data
    const bundleEl = document.getElementById(bundleId);
    if (bundleEl) {
        bundleEl.setAttribute('data-linked-ids', '[]');

        // Remove #Set Badge from Bundle Header if exists
        const h4 = bundleEl.querySelector('h4');
        const setBadge = h4 ? h4.querySelector('.bundle-set-num') : null;
        if (setBadge) setBadge.remove(); // Or text empty? If we remove, syncBundles recreates it if needed. 
        // Actually syncBundles will recreate it because it iterates ALL bundles.
        // But since data-linked-ids is empty, syncBundles won't find questions for it?
        // Wait, syncBundles assigns Set # regardless of linking?
        // Yes, "bundles.forEach((bundle, idx) => setNum = idx+1".
        // So the Set # badge on the bundle itself should PERSIST even if empty?
        // "ë¬¶ìŒì¹´ë“œë¥?ì§€?°ë©´ ?°ê²°??ë¬¸í•­??Set???ˆì‚¬?¼ì?ê³?.." was the previous issue.
        // Now we are just unlinking. The Bundle still exists. So it IS "Set 1". It just has 0 questions.
        // So we do NOT remove the set badge from the bundle title. It stays "Set 1" (Empty).
    }

    // Clear Input
    const input = document.getElementById(bundleId + '-link-input');
    if (input) input.value = '';

    updateQuestionNumbers();
    // alert("?°ê²°???´ì œ?˜ì—ˆ?µë‹ˆ??"); // Removed
}

function updateSubTypes(id, section) {
    const el = document.getElementById(id + '-subtype');
    if (el) {
        el.innerHTML = renderSubTypeOptions(section, '');
        // [New] Reset background to empty state (amber-50) since value is reset
        el.className = el.className.replace('bg-white', '').replace('bg-amber-50', '') + ' bg-amber-50';
    }
}

function renderImageUploader(id, d, size = 'normal') {
    const height = size === 'small' ? 'h-24' : 'h-40';
    return `
                <div class="flex flex-col gap-2">
             <label class="flex items-center gap-2 cursor-pointer bg-white border border-dashed border-slate-300 rounded p-2 hover:bg-blue-50 transition-all justify-center">
                 <span class="text-sm">?“‚ Upload</span>
                 <input type="file" id="${id}-file" data-field="file" class="hidden" accept="image/*" onchange="previewBuilderImg(this, '${id}')">
             </label>
             <div id="${id}-preview" data-field="preview" class="${(d.imgUrl && d.imgUrl !== 'undefined' && d.imgUrl !== 'null') ? '' : 'hidden'} relative mt-1 border rounded bg-slate-100 overflow-hidden">
                 <img src="${(d.imgUrl && d.imgUrl !== 'undefined' && d.imgUrl !== 'null') ? fixDriveUrl(d.imgUrl) : ''}" class="${height} object-contain mx-auto" referrerpolicy="no-referrer">
                 <button onclick="clearBuilderImg('${id}')" class="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 shadow hover:bg-red-50 text-xs">??/button>
             </div>
        </div>
                `;
}


// [Sanitizer] contenteditable innerHTML ?€????Tailwind --tw-* CSS ë³€???œê±°
// ?´ìœ : ë¸Œë¼?°ì?ê°€ DOM ?”ì†Œ???ë™ ì£¼ì…?˜ëŠ” --tw-* ë³€?˜ë“¤??innerHTML???¬í•¨??
//       êµ¬ê? ?œíŠ¸ ?€?????€??ë¹„ë??´ì???ë¬¸ì œ ë°©ì?. ?¬ìš©???œì‹(ë³¼ë“œ ???€ ë³´ì¡´.
function stripTwStyles(html) {
    if (!html) return html;
    // 1. style ?ì„± ??--tw-ë¡??œì‘?˜ëŠ” ? ì–¸?¤ë§Œ ?œê±° (?¤ë¥¸ ?¸ë¼???¤í??¼ì? ë³´ì¡´)
    let cleaned = html.replace(/style="([^"]*)"/gi, function(match, styleContent) {
        const filtered = styleContent
            .split(';')
            .filter(function(decl) { return decl.trim() && !decl.trim().startsWith('--tw-'); })
            .join(';')
            .replace(/;+$/, '')
            .trim();
        return filtered ? 'style="' + filtered + '"' : '';
    });
    // 2. ì¤„ë°”ê¿??œê±° (êµ¬ê? ?œíŠ¸?ì„œ ?€??ê±°ë??´ì????ì¸)
    cleaned = cleaned.replace(/\r?\n/g, '');
    // 3. ? í–‰/?„í–‰ ë¹??œê·¸ ?œê±° (?€ ?œì‘ ê³µë? ?ì¸: <div></div>, <br>, <p></p> ??
    cleaned = cleaned.replace(/^(\s*<(div|p|span|br)\s*\/?\s*>\s*<\/(div|p|span)>\s*|<br\s*\/?\s*>\s*)+/gi, '');
    cleaned = cleaned.replace(/(\s*<(div|p|span|br)\s*\/?\s*>\s*<\/(div|p|span)>\s*|<br\s*\/?\s*>\s*)+$/gi, '');
    return cleaned.trim();
}
// Utility
function autoResize(el) {
    // [Fix v3] scroll-behavior:smooth ì°¨ë‹¨ + ëª¨ë“  ?¤í¬ë¡?ë¶€ëª??¼ê´„ ?€??ë³µì›
    // ?ì¸: obj/subj ì¹´ë“œê°€ zone-question ë·°í¬?¸ë? ì´ˆê³¼???? height:auto ë¡??œê°„ ì¶•ì†Œ ??
    //       ë¸Œë¼?°ì?ê°€ scrollTop??0?¼ë¡œ ?´ë¨?‘í•˜ê³? scroll-smooth ë¡??¸í•´ ë³µê? ? ë‹ˆë©”ì´??ë°œë™
    //       ??"?„ë¡œ ê°”ë‹¤ê°€ ?Œì•„?¤ëŠ”" ?„ìƒ
    // ?´ê²°: height ë³€ê²???ëª¨ë“  ?¤í¬ë¡?ë¶€ëª¨ì˜ scrollBehaviorë¥?autoë¡?ì¦‰ì‹œ ê°•ì œ ??ì¦‰ì‹œ scrollTop ë³µì›
    const scrollParents = [];
    let p = el.parentElement;
    while (p) {
        const ov = getComputedStyle(p).overflowY;
        if (ov === 'auto' || ov === 'scroll') {
            const savedBehavior = p.style.scrollBehavior;
            p.style.scrollBehavior = 'auto'; // smooth ? ë‹ˆë©”ì´??ì¦‰ì‹œ ì°¨ë‹¨
            scrollParents.push({ el: p, top: p.scrollTop, behavior: savedBehavior });
        }
        p = p.parentElement;
    }

    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';

    // scrollTop ì¦‰ì‹œ ë³µì› ??scrollBehavior ?ìƒë³µêµ¬
    scrollParents.forEach(sp => {
        sp.el.scrollTop = sp.top;
        sp.el.style.scrollBehavior = sp.behavior;
    });
}

// [New] Google Drive URL Fixer
// [New] Google Drive URL Fixer
function fixDriveUrl(url) {
    if (!url || typeof url !== 'string') return "";

    // [Student View Sync] ?¸ë„¤???”ë“œ?¬ì¸???¬ìš© (ë³´ì•ˆ ?°íšŒ)
    // script.js Line 423 getSafeImageUrl -> convertToDirectLink ë¡œì§ê³??™ì¼??
    const patterns = [
        /file\/d\/([a-zA-Z0-9-_]+)/,
        /id=([a-zA-Z0-9-_]+)/,
        /folders\/([a-zA-Z0-9-_]+)/,
        /open\?id=([a-zA-Z0-9-_]+)/,
        /uc\?.*id=([a-zA-Z0-9-_]+)/
    ];

    for (let pattern of patterns) {
        let match = url.match(pattern);
        if (match && match[1]) {
            // sz=w1000 ?€ ê³ í•´?ë„ ?”ì²­
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
    }
    return url;
}

// Builder Image Helpers
function previewBuilderImg(input, id) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const MAX_MB = 1;
        const MAX_BYTES = MAX_MB * 1024 * 1024;

        // [?´ë?ì§€ ?©ëŸ‰ ?œí•œ] 1MB ì´ˆê³¼ ??ì¦‰ì‹œ ì°¨ë‹¨
        if (file.size > MAX_BYTES) {
            showToast(`? ï¸ ?´ë?ì§€ ?©ëŸ‰ ì´ˆê³¼! 1MB ?´í•˜ ?Œì¼ë§??±ë¡ ê°€?¥í•©?ˆë‹¤.\n(?„ì¬ ?Œì¼: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
            input.value = ''; // ?Œì¼ ? íƒ ì´ˆê¸°??
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById(`${id}-preview`);
            const img = preview.querySelector('img');
            img.src = e.target.result;
            preview.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    }
}

function clearBuilderImg(id) {
    const input = document.getElementById(`${id}-file`);
    if (input) input.value = '';
    const preview = document.getElementById(`${id}-preview`);
    if (preview) {
        preview.classList.add('hidden');
        preview.querySelector('img').src = '';
    }
}


// --- Edit Form Builder (New 08-2) ---
// --- Edit Form Builder (New 07-2) ---
function renderEditForm(qId) {
    const q = globalConfig.questions.find(item => item.id === qId);
    if (!q) return showToast("? ï¸ ë¬¸í•­ ?•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.");

    // [Fix] ì§ì „ ì¹´í…Œê³ ë¦¬ ID ë³´ì¡´ (Cancel ë³µê???
    window._editReturnCatId = q.catId || curCatId || '';

    setCanvasId('08-2');
    const c = document.getElementById('dynamic-content');

    // [Fix] app-canvas ?¨ë”© ?œê±° (07-2 ì½˜í…ì¸??ì—­ ìµœë??? ?¬ì´?œë°”??? ì?)
    const ac = document.getElementById('app-canvas');
    if (ac) ac.style.padding = '0';
    document.getElementById('app-canvas').classList.add('!overflow-hidden');

    // Make layout structurally identical to 07-1 (Split View 3:6:1) for builder compatibility
    c.classList.add('h-full');
    c.innerHTML = `
        <!-- [Edit Mode Layout] 100% height to fit within header/footer -->
        <div style="width: 100%; height: 100%; background-color: #f8fafc; position: relative; overflow: hidden;">
            
            <!-- Builder Header (Block Element, Fixed Height) -->
            <div id="builder-header" style="display: flex; align-items: center; justify-content: space-between; width: 100%; height: 60px; background-color: white; border-bottom: 1px solid #e2e8f0; z-index: 500; position: relative; padding: 0 24px;">
                 <!-- Left: Title -->
                 <div class="flex items-center gap-4">
                    <h2 class="font-bold bg-[#013976] text-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2" style="font-size: 17px;">
                        <span class="text-xl">?ï¸</span> Edit Mode
                    </h2>
                    <div class="flex items-center gap-2">
                        <span class="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded text-sm font-bold shadow-sm border border-indigo-100">
                            ID: ${qId}
                        </span>
                    </div>
                </div>

                 <!-- Center: Hidden Toolbar -->
                 <div class="flex items-center gap-2 flex-1 justify-center opacity-50 pointer-events-none select-none">
                     <span class="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                         ?¹ï¸ ?˜ì • ëª¨ë“œ?ì„œ???´ë‹¹ ë¬¸í•­ ë°??Œì† ì§€ë¬¸ë§Œ ?˜ì • ê°€?¥í•©?ˆë‹¤.
                     </span>
                 </div>
                
                <!-- Right: Actions -->
                <div class="flex items-center gap-2">
                    <button onclick="updateBuilderQuestion('${qId}')" class="btn-ys !bg-teal-600 !text-white shadow-md hover:brightness-110 !px-4 !py-1.5 !text-sm !h-auto !rounded shrink-0 flex items-center gap-2 font-bold">
                        ?’¾ Update
                    </button>
                    
                    <button onclick="exitEditMode()" class="btn-ys !bg-slate-100 !text-slate-500 !border-slate-200 hover:bg-slate-200 hover:text-slate-700 shadow-none !px-3 !py-1.5 !text-sm !h-auto !rounded shrink-0">
                        ??Cancel
                    </button>
                </div>
            </div>
    
              <!-- Builder Body (Calc Height based on 60px header) -->
              <div style="display: flex; width: 100%; height: calc(100% - 60px); background-color: #f8fafc; position: relative;">
                  
                  <!-- [Right] Form Builder 2-Column Split Layout for Edit Mode -->
                  <div id="builder-main-area" class="flex-1 w-full relative px-6 pb-6 pt-3 h-full">
                      <input type="hidden" data-field="catId" value="${q.catId || ''}">
                      <div class="h-full grid grid-cols-[3.5fr_6.5fr] gap-6">
                          
                          <!-- Zone A: Bundle (35%) -->
                          <div class="flex flex-col h-full overflow-hidden">
                              <div class="mb-3 font-bold text-sm flex items-center gap-2 flex-none h-8">
                                  <span class="text-[17px] text-[#013976]">?“¦ Bundles</span>
                              </div>
                              <div id="zone-bundle" class="flex-1 min-h-0 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl p-4 space-y-4 scroll-smooth overflow-y-auto">
                                  <div id="placeholder-bundle" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                      <span class="text-3xl mb-2">?“¦</span>
                                      <span class="text-[14px]">?°ê²°??ì§€ë¬¸ì´ ?†ìŠµ?ˆë‹¤</span>
                                  </div>
                              </div>
                          </div>

                          <!-- Zone B: Questions (65%) -->
                          <div class="flex flex-col h-full overflow-hidden">
                             <div class="mb-3 font-bold text-sm flex items-center gap-2 flex-none h-8">
                                  <span class="text-[17px] text-[#013976]">?“ Questions</span>
                                  <div id="section-stats" class="flex items-center gap-2 ml-2 overflow-x-auto no-scrollbar"></div>
                              </div>
                              <div id="zone-question" class="flex-1 min-h-0 bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-inner relative scroll-smooth overflow-y-auto">
                                  <div id="placeholder-question" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60" style="display:none;">
                                      <span class="text-3xl mb-2">?“</span>
                                      <span class="text-[14px]">ë¬¸í•­ ?Œë”ë§?ì¤?..</span>
                                  </div>
                              </div>
                          </div>

                      </div>
                  </div>

              </div>
          </div>
      `;

    // [Fix] DOM ?Œë”ë§??„ë£Œ ??ì»´í¬?ŒíŠ¸ ì´ˆê¸°??(ì´ˆê¸° ?Œë”ë§?ì§€??ë°©ì?)
    setTimeout(() => {

    // 1. If part of a Bundle, load Bundle into Zone A
    let bundleIdToLoad = q.setId;
    if (bundleIdToLoad && bundleIdToLoad !== "") {
        const bundleInfo = (globalConfig.bundles || []).find(b => b.id === bundleIdToLoad);
        if (bundleInfo) {
            // [Fix] Sanitize Passage (Empty HTML Check) ??07-1ê³??™ì¼
            let rawHtml = bundleInfo.text || "";
            if (rawHtml.replace(/<[^>]*>/g, '').trim() === '' && !rawHtml.includes('<img')) {
                rawHtml = "";
            }

            addComponent('bundle', {
                id: bundleInfo.id,
                groupId: bundleInfo.id, // [Fix] Preserve Original UUID as Group ID ??07-1ê³??™ì¼
                title: bundleInfo.title || 'ì§€ë¬?ë¬¶ìŒ',
                html: rawHtml,
                imgUrl: (bundleInfo.imgUrl && bundleInfo.imgUrl !== 'undefined' && bundleInfo.imgUrl !== 'null') ? fixDriveUrl(bundleInfo.imgUrl) : ""
            });
        }
    }

    // 2. Load Question into Zone B
    // [ROOT CAUSE FIX] DB(GET_FULL_DB)ê°€ ë°˜í™˜?˜ëŠ” ?„ë“œ: type, choices, title, text, imgUrl
    // 07-1 ?¨í„´: q.type === 'ê°ê??? ? 'obj' : 'subj'
    const qType = q.type || q.questionType || '';
    let type = (qType.includes('ê°ê?') || qType === 'obj') ? 'obj' : 'subj';
    // fallback: choices ì¡´ì¬ ??ë¬´ì¡°ê±?obj
    if (type === 'subj' && q.choices && Array.isArray(q.choices) && q.choices.length > 0) {
        type = 'obj';
    }
    console.log('[07-2 Debug] q.type:', q.type, '??resolved:', type);

    addComponent(type, {
        id: q.id,
        sec: q.section,
        sub: q.subType,
        diff: q.difficulty,
        score: q.score,
        text: q.title,  // 07-1ê³??™ì¼: DB??title??ë°œë¬¸
        // [Fix] Sanitize Inner Passage ??07-1ê³??™ì¼
        innerPassage: (q.text && q.text.replace(/<[^>]*>/g, '').trim() === '' && !q.text.includes('<img')) ? "" : q.text,
        answer: q.answer,
        modelAnswer: q.modelAnswer,
        options: q.choices,  // 07-1ê³??™ì¼: DB??choicesê°€ ë³´ê¸° ë°°ì—´
        imgUrl: (q.imgUrl && q.imgUrl !== 'undefined' && q.imgUrl !== 'null') ? fixDriveUrl(q.imgUrl) : "",
        isLinked: bundleIdToLoad ? true : false,
        linkedGroupId: bundleIdToLoad || ''
    });

    // Link in DOM (07-1ê³??™ì¼)
    if (bundleIdToLoad) {
        const qEl = document.getElementById(q.id);
        if (qEl) qEl.setAttribute('data-bundle-id', bundleIdToLoad);
    }

    }, 100); // DOM ?ˆì •???€ê¸?
}

// [New] Exit Edit Mode ??Return to previous bank view with category selected
function exitEditMode(skipConfirm = false) {
    // [Fix] ?€???„ë£Œ ???¸ì¶œ ??skipConfirm=true)?ëŠ” ?•ì¸ ?ì—… ?ëµ
    if (!skipConfirm && !confirm("?‘ì„± ì¤‘ì¸ ?´ìš©?€ ?€?¥ë˜ì§€ ?ŠìŠµ?ˆë‹¤. ?˜ê??œê² ?µë‹ˆê¹?")) return;

    // Restore app-canvas padding
    const ac = document.getElementById('app-canvas');
    if (ac) ac.style.padding = '';

    // Restore layout
    document.getElementById('app-canvas').classList.remove('!overflow-hidden');
    document.body.classList.add('has-sidebar');

    // Return to Bank with previous category auto-selected
    const returnCatId = window._editReturnCatId || '';

    // Set curCatId BEFORE renderBank so the select renders with correct selection
    if (returnCatId) curCatId = returnCatId;
    renderBank();

    if (returnCatId) {
        // Trigger category load to show question list
        setTimeout(() => {
            handleBankCategoryChange(returnCatId);
        }, 200);
    }
}

// [SAFE] Partial Update Logic ??Only modifies the specific row in the sheet
async function updateBuilderQuestion(originalId) {
    try {
        if (!originalId) throw new Error("?˜ì •??ë¬¸í•­ IDê°€ ?†ìŠµ?ˆë‹¤.");

        const result = await collectBuilderData(); // From UI
        if (!result.groups || result.groups.length === 0) throw new Error("?˜ì • ?´ìš©???½ì–´?????†ìŠµ?ˆë‹¤.");

        const firstGroup = result.groups[0];
        if (!firstGroup || firstGroup.questions.length === 0) throw new Error("ë¬¸í•­??ì¡´ì¬?˜ì? ?ŠìŠµ?ˆë‹¤.");

        // [Fix] origQë¥?targetBundleIdë³´ë‹¤ ë¨¼ì? ? ì–¸ (?œì„œ ë³´ì¥)
        const origQ = globalConfig.questions.find(q => q.id === originalId);
        if (!origQ) throw new Error("?ë³¸ ë¬¸í•­??ë¡œì»¬ ?€?¥ì†Œ?ì„œ ì°¾ì„ ???†ìŠµ?ˆë‹¤.");

        const qInput = firstGroup.questions[0];
        const passageData = firstGroup.passage;
        const isGeneral = passageData.title === 'General';
        // [Fix] 07-1 setId ì§ì ‘ ì°¸ì¡° ë°©ì‹ê³??™ì¼?˜ê²Œ: origQ.setId(DB ?ë³¸ UUID) ?°ì„  ?¬ìš©
        const targetBundleId = isGeneral ? "" : (origQ.setId || passageData.id || "");

        // [New] ë³€ê²½ì‚¬??ê°ì?: ?˜ì •???´ìš©???†ìœ¼ë©??€??ë¶ˆí•„??
        const choicesChanged = JSON.stringify(origQ.choices || []) !== JSON.stringify(qInput.choices || []);
        const questionChanged =
            String(origQ.section || '') !== String(qInput.sec || '') ||
            String(origQ.subType || '') !== String(qInput.sub || '') ||
            String(origQ.difficulty || '') !== String(qInput.diff || '') ||
            String(origQ.score || 0) !== String(qInput.score || 0) ||
            (origQ.title || '') !== (qInput.title || '') ||
            (origQ.answer || '') !== (qInput.answer || '') ||
            (origQ.modelAnswer || '') !== (qInput.modelAnswer || '') ||
            choicesChanged;

        // ë²ˆë“¤???ˆëŠ” ê²½ìš° ì§€ë¬?ë³€ê²½ì‚¬??„ ?•ì¸
        let bundleChanged = false;
        if (!isGeneral && targetBundleId) {
            const existingBundle = (globalConfig.bundles || []).find(b => b.id === targetBundleId);
            if (existingBundle) {
                bundleChanged =
                    (existingBundle.title || '') !== (passageData.title || '') ||
                    (existingBundle.text || '') !== (passageData.text || '');
            }
        }

        if (!questionChanged && !bundleChanged) {
            showToast("? ï¸ ?˜ì •???¬í•­???†ìŠµ?ˆë‹¤.");
            return;
        }

        if (!confirm("?˜ì • ?´ìš©???€?¥í•˜?œê² ?µë‹ˆê¹?")) return;

        toggleLoading(true);

        const category = globalConfig.categories.find(c => c.id === result.catId);
        if (!category) throw new Error("ì¹´í…Œê³ ë¦¬ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.");
        const parentFolderId = extractFolderId(category.targetFolderUrl);
        const categoryName = category.name;

        // --- Build question row data (same format as SAVE_FULL_TEST_DATA) ---
        const questionData = {
            no: origQ.no,           // ë¬¸í•­ë²ˆí˜¸ (???ë³„??
            id: originalId,         // ?„ë¡ ??ID (???ë³„??ë°±ì—…)
            section: qInput.sec || '',
            subType: qInput.sub || '',
            type: qInput.type || 'ê°ê???,
            difficulty: qInput.diff || 'ì¤?,
            score: qInput.score || 0,
            title: qInput.title || '',       // ì§ˆë¬¸ ?´ìš©
            text: qInput.innerPassage || '', // ì§€ë¬??´ìš©
            answer: qInput.answer || '',
            modelAnswer: qInput.modelAnswer || '',
            choices: qInput.choices || [],
            setId: targetBundleId
        };

        // Image handling
        if (qInput.qImgData && qInput.qImgData.base64) {
            questionData.imgData = qInput.qImgData;
        } else if (qInput.qImg) {
            questionData.imgUrl = qInput.qImg;
        }

        // --- Build bundle data (if applicable) ---
        let bundleData = null;
        if (!isGeneral && targetBundleId) {
            bundleData = {
                id: targetBundleId,
                title: passageData.title || '',
                text: stripTwStyles(passageData.text || '')
            };
            if (passageData.imgData && passageData.imgData.base64) {
                // ???´ë?ì§€ ?…ë¡œ?œëœ ê²½ìš°
                bundleData.imgData = passageData.imgData;
            } else if (passageData.img) {
                // UI ë¯¸ë¦¬ë³´ê¸°?ì„œ ê¸°ì¡´ URL ?½ì–´??ê²½ìš°
                bundleData.imgUrl = passageData.img;
            } else {
                // [Fix] UI?ì„œ ?´ë?ì§€ ?½ê¸° ?¤íŒ¨?˜ë”?¼ë„ ë¡œì»¬ ìºì‹œ?ì„œ ê¸°ì¡´ ë²ˆë“¤ ?´ë?ì§€ URL ë³´ì¡´
                // (07-1 ë°©ì‹: setIdë¡?ë²ˆë“¤??ì°¾ì•„ ?°ì´??ë³´ì¡´)
                const existingBundle = (globalConfig.bundles || []).find(b => b.id === targetBundleId);
                if (existingBundle && existingBundle.imgUrl) {
                    bundleData.imgUrl = existingBundle.imgUrl;
                }
            }
        }

        // --- Send to backend (Partial Update API) ---
        const payload = {
            type: 'UPDATE_QUESTION',
            parentFolderId: parentFolderId,
            categoryName: categoryName,
            question: questionData,
            bundle: bundleData  // null if no bundle
        };

        const response = await fetch(globalConfig.masterUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (resData.status === "Success") {
            // Clear local cache for this category (will re-fetch fresh data)
            globalConfig.questions = globalConfig.questions.filter(q => q.catId !== result.catId);
            globalConfig.bundles = (globalConfig.bundles || []).filter(b => b.catId !== result.catId);
            save();

            showToast("???´ë‹¹ ë¬¸í•­ë§??ˆì „?˜ê²Œ ?˜ì • ?„ë£Œ! (?¤ë¥¸ ?°ì´???í–¥ ?†ìŒ)");
            exitEditMode(true); // [Fix] ?€???„ë£Œ ?„ì´ë¯€ë¡??•ì¸ ?ì—… ?ëµ
        } else {
            throw new Error(resData.message || "?œë²„ ë¶€ë¶??…ë°?´íŠ¸ ?¤íŒ¨");
        }

    } catch (e) {
        console.error(e);
        showToast("???˜ì • ?¤íŒ¨: " + e.message);
    } finally {
        toggleLoading(false);
    }
}

// [New] Load Questions for Builder
async function loadQuestionsFromCategory(catId) {
    // If called from button without arg, get value
    if (!catId) {
        const sel = document.getElementById('reg-target-cat');
        if (sel) catId = sel.value;
    }

    if (!catId) {
        showToast("? ï¸ ë¶ˆëŸ¬???œí—˜ì§€(ì¹´í…Œê³ ë¦¬)ë¥?? íƒ?´ì£¼?¸ìš”.");
        return;
    }

    if (!confirm("? ï¸ ?ˆë¡œ???œí—˜ì§€ë¥?ë¶ˆëŸ¬?¤ë©´ ?„ì¬ ?‘ì„± ì¤‘ì¸ ?´ìš©?€ ì´ˆê¸°?”ë©?ˆë‹¤. ê³„ì†?˜ì‹œê² ìŠµ?ˆê¹Œ?")) {
        return;
    }

    toggleLoading(true);

    try {
        // 1. Fetch Data from Backend (Integrated DB)
        const category = globalConfig.categories.find(c => c.id === catId);
        if (!category) throw new Error("Category Not Found");

        const parentFolderId = extractFolderId(category.targetFolderUrl);
        const categoryName = category.name;

        const response = await sendReliableRequest({
            type: 'GET_FULL_DB',
            parentFolderId: parentFolderId,
            categoryName: categoryName
        });

        // 2. Parse & Update Global Config
        const fetchedQuestions = response.questions || [];
        const fetchedBundles = response.bundles || [];

        // Update Global State (Replace for this category)
        // Remove old questions/bundles for this category
        globalConfig.questions = globalConfig.questions.filter(q => q.catId !== catId);
        globalConfig.bundles = (globalConfig.bundles || []).filter(b => b.catId !== catId);

        fetchedQuestions.forEach(q => q.catId = catId);
        fetchedBundles.forEach(b => b.catId = catId);

        globalConfig.questions.push(...fetchedQuestions);
        globalConfig.bundles.push(...fetchedBundles);

        save(); // Persist to LocalStorage

        // 3. Clear Workspace
        const zoneB = document.getElementById('zone-question');
        const zoneA = document.getElementById('zone-bundle');
        const zoneC = document.getElementById('zone-navigator');
        if (zoneB) zoneB.innerHTML = '<div id="placeholder-question" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60"><span class="text-3xl mb-2">?“</span><span class="text-[14px]">ë¬¸í•­ ì¹´ë“œ ì¶”ê?</span></div>';
        if (zoneA) zoneA.innerHTML = '<div id="placeholder-bundle" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60"><span class="text-3xl mb-2">?“¦</span><span class="text-[14px]">ì§€ë¬?ë¬¶ìŒ ì¶”ê?</span></div>';
        if (zoneC) zoneC.innerHTML = '';

        // 4. Render
        if (fetchedQuestions.length === 0) {
            showToast("?“­ ?´ë‹¹ ì¹´í…Œê³ ë¦¬???€?¥ëœ ë¬¸í•­???†ìŠµ?ˆë‹¤.");
            return;
        }

        // Sort by Index/Number
        fetchedQuestions.sort((a, b) => (a.no || 0) - (b.no || 0));

        // Group by Bundle (SetID)
        const bundleMap = new Map();
        const orphans = [];

        fetchedQuestions.forEach(q => {
            if (q.setId && q.setId !== "") {
                if (!bundleMap.has(q.setId)) {
                    // Find Bundle Info
                    const bundleInfo = fetchedBundles.find(b => b.id === q.setId);

                    // [Fix] Sanitize Passage (Empty HTML Check)
                    // [Fix] imgUrl??HTML?´ë©´ textë¡?êµì • (ì»¬ëŸ¼ ?¤ì—¼ ë³µêµ¬)
                    if (bundleInfo?.imgUrl && bundleInfo.imgUrl.trim().startsWith('<')) {
                        if (!bundleInfo.text) bundleInfo = { ...bundleInfo, text: bundleInfo.imgUrl };
                        bundleInfo = { ...bundleInfo, imgUrl: '' };
                    }
                    let rawHtml = bundleInfo?.text || "";
                    // If text only contains tags/whitespace and no images, treat as empty
                    if (rawHtml.replace(/<[^>]*>/g, '').trim() === '' && !rawHtml.includes('<img')) {
                        rawHtml = "";
                    }

                    bundleMap.set(q.setId, {
                        id: q.setId,
                        title: bundleInfo?.title || "ì§€ë¬?ë¬¶ìŒ",
                        html: rawHtml,
                        imgUrl: (bundleInfo?.imgUrl && bundleInfo.imgUrl !== 'undefined' && bundleInfo.imgUrl !== 'null') ? fixDriveUrl(bundleInfo.imgUrl) : "",
                        questions: []
                    });
                }
                bundleMap.get(q.setId).questions.push(q);
            } else {
                orphans.push(q);
            }
        });

        // [Fix] DOM ?ˆì •????ì»´í¬?ŒíŠ¸ ?Œë”ë§?(?ë””??ì´ˆê¸°??ì§€??ë°©ì?)
        setTimeout(() => {
        // Render Bundles & Linked Questions
        bundleMap.forEach((bundleData, setId) => {
            // Zone A: Bundle
            addComponent('bundle', {
                id: setId,
                groupId: setId, // [Fix] Preserve Original UUID as Group ID
                title: bundleData.title,
                html: bundleData.html,
                imgUrl: bundleData.imgUrl
            });

            // Zone B: Questions
            bundleData.questions.forEach(q => {
                const type = q.type === 'ê°ê??? ? 'obj' : 'subj';
                addComponent(type, {
                    id: q.id,
                    sec: q.section,
                    sub: q.subType,
                    diff: q.difficulty,
                    score: q.score,
                    text: q.title, // Fixed: Title
                    // [Fix] Sanitize Inner Passage
                    innerPassage: (q.text && q.text.replace(/<[^>]*>/g, '').trim() === '' && !q.text.includes('<img')) ? "" : q.text,
                    answer: q.answer,
                    modelAnswer: q.modelAnswer,
                    options: q.choices, // Fixed: 'options' for UI, 'choices' from DB
                    imgUrl: (q.imgUrl && q.imgUrl !== 'undefined' && q.imgUrl !== 'null') ? fixDriveUrl(q.imgUrl) : "", // [Fix] Sanitize on Load
                    isLinked: true,
                    linkedGroupId: setId
                });
                // Link in DOM
                const qEl = document.getElementById(q.id);
                if (qEl) qEl.setAttribute('data-bundle-id', setId);
            });
        });

        // Render Orphans
        orphans.forEach(q => {
            const type = q.type === 'ê°ê??? ? 'obj' : 'subj';
            addComponent(type, {
                id: q.id,
                sec: q.section,
                sub: q.subType,
                diff: q.difficulty,
                score: q.score,
                text: q.title,
                // [Fix] Sanitize Inner Passage
                innerPassage: (q.text && q.text.replace(/<[^>]*>/g, '').trim() === '' && !q.text.includes('<img')) ? "" : q.text,
                answer: q.answer,
                modelAnswer: q.modelAnswer,
                options: q.choices,
                imgUrl: (q.imgUrl && q.imgUrl !== 'undefined' && q.imgUrl !== 'null') ? fixDriveUrl(q.imgUrl) : "" // [Fix] Sanitize on Load
            });
        });

        // Finalize
        updateQuestionNumbers();

        // Sync Bundle Link UI
        bundleMap.forEach((_, setId) => {
            const bundleEl = document.getElementById(setId);
            if (bundleEl) {
                const linkedQs = document.querySelectorAll(`.builder-item[data-bundle-id="${setId}"]`);
                const nums = Array.from(linkedQs).map(q => q.getAttribute('data-q-num')).filter(n => n).map(Number).sort((a, b) => a - b);
                const input = document.getElementById(`${setId}-link-input`);
                if (input) input.value = nums.join(', ');

                const ids = Array.from(linkedQs).map(q => q.id);
                bundleEl.setAttribute('data-linked-ids', JSON.stringify(ids));
            }
        });

        // Re-sync UI styles
        const allQs = Array.from(document.querySelectorAll('#zone-question .builder-item'));
        syncBundles(allQs);

        showToast(`??${fetchedQuestions.length}ê°?ë¬¸í•­??ë¶ˆëŸ¬?”ìŠµ?ˆë‹¤.`);

        }, 100); // setTimeout end (DOM ?ˆì •???€ê¸?

    } catch (e) {
        console.error(e);
        showToast("??ë¶ˆëŸ¬?¤ê¸° ?¤íŒ¨: " + e.message);
    } finally {
        toggleLoading(false);
    }
}




// [New] Save Reg Group (Integrated Full Save)
async function saveRegGroup() {
    try {
        const result = await collectBuilderData(); // Returns { catId, groups: [{passage, questions}, ...] }
        if (!result.catId) throw new Error("ì¹´í…Œê³ ë¦¬ê°€ ? íƒ?˜ì? ?Šì•˜?µë‹ˆ??");

        // 1. Prepare Data for Save
        // We will OVERWRITE the Global Config for this Category with the Builder State
        // WARN: If user filtered logic in `load`, they might be overwriting unseen questions?
        // `loadQuestionsFromCategory` loads ALL questions of that category.
        // So Builder State = Full State of Category.
        // Thus, SAFE to overwrite.

        const newQuestions = [];
        const newBundles = [];

        let qCounter = 0;

        result.groups.forEach((group, gIdx) => {
            const isGeneral = group.passage.title === 'General';

            // Bundle Data (Skip if General holder)
            let setId = "";
            if (!isGeneral) {
                setId = group.passage.id; // Use existing ID if available (passed from load)
                if (!setId || setId.length < 5) setId = generateUUID();

                // ?°ê²° ë¬¸í•­ ë²ˆí˜¸ ê³„ì‚° (qCounter + 1ë¶€???œì‘)
                const linkedNums = group.questions.map((_, i) => qCounter + i + 1).join(', ');

                newBundles.push({
                    id: setId,
                    title: group.passage.title,
                    text: group.passage.text, // HTML
                    imgUrl: group.passage.img || "",
                    imgData: group.passage.imgData,
                    questionIds: linkedNums
                });
            }

            // Question Data
            group.questions.forEach(q => {
                qCounter++;
                newQuestions.push({
                    no: qCounter, // Assign Number based on Order
                    id: q.id,
                    catId: result.catId, // Ensure CatID
                    section: q.sec,
                    subType: q.sub,
                    type: q.type, // Fixed
                    difficulty: q.diff || 'ì¤?,
                    score: q.score,
                    title: q.title, // Fixed: GS Use 'title' column
                    text: q.passageText || "", // Fixed: Passage content for Q from Q card

                    // New Schema:
                    setId: isGeneral ? "" : setId,

                    // Images
                    imgUrl: q.qImg || "", // Fixed: GS Use 'imgUrl'
                    imgData: q.qImgData,

                    choices: q.options || q.choices, // Use options from serializeBuilderState or fallback
                    answer: q.answer || '', // Both types use answer field now
                    modelAnswer: q.modelAnswer || '' // Both types use modelAnswer
                });
            });
        });

        if (newQuestions.length === 0) throw new Error("?€?¥í•  ë¬¸í•­???†ìŠµ?ˆë‹¤.");

        const category = globalConfig.categories.find(c => c.id === result.catId);

        // [User Request] 2-Step Confirmation
        if (!confirm(`${category.name} ?œí—˜ì§€???€?¥ì´ ë§ìŠµ?ˆê¹Œ ? `)) return;
        if (!confirm("ê¸°ì¡´ DBê°€ ëª¨ë‘ ?? œ?˜ê³ , ??DBë¡???–´?°ê¸°ê°€ ?©ë‹ˆ?? ?í•œ ?€???„ë£Œ ??ë¬¸í•­?±ë¡ ?”ë©´??ì´ˆê¸°???©ë‹ˆ??")) return;

        toggleLoading(true);

        // Payload
        const payload = {
            type: 'SAVE_FULL_TEST_DATA',
            parentFolderId: extractFolderId(category.targetFolderUrl),
            categoryName: category.name,
            questions: newQuestions,
            bundles: newBundles
        };

        const response = await fetch(globalConfig.masterUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (resData.status === "Success") {
            showToast("???±ê³µ?ìœ¼ë¡??€?¥ë˜?ˆìŠµ?ˆë‹¤!");

            // [Fix] Do NOT update Global Config with strictly local data (missing URLs)
            // Just clear cache for this category so next load fetches fresh
            globalConfig.questions = globalConfig.questions.filter(q => q.catId !== result.catId);
            if (globalConfig.bundles) globalConfig.bundles = globalConfig.bundles.filter(b => b.catId !== result.catId);
            // We do NOT push newQuestions here because they lack the server-generated image URLs
            // The user will re-fetch data on next load.

            save(); // Local Storage

            // Reload/Reset Builder View (Stay on Screen)
            window.removeEventListener('beforeunload', handleBeforeUnload);
            renderRegForm();
        } else {
            throw new Error(resData.message || "?€???¤íŒ¨");
        }

    } catch (e) {
        console.error(e);
        showToast("???€??ì¤??¤ë¥˜: " + e.message);
    } finally {
        toggleLoading(false);
    }
}




// [Robust Fix] collectBuilderData using data-fields
// This ensures reliable data collection by avoiding dynamic ID queries
async function collectBuilderData() {
    // 1st Pass: Scope Scanned to relevant Area
    const container = document.getElementById('builder-main-area') || document.getElementById('reg-canvas');
    if (!container) throw new Error("ë¹Œë” ?ì—­??ì°¾ì„ ???†ìŠµ?ˆë‹¤.");

    const blocks = container.querySelectorAll('.builder-item');
    if (blocks.length === 0) throw new Error("ë¬¸í•­???†ìŠµ?ˆë‹¤. PDFë¥?ê°€?¸ì˜¤ê±°ë‚˜ ì¶”ê??˜ì„¸??");

    let catId = '';
    let commonTitle = '';

    // 1. Get Category from Top Bar (Direct Link)
    const catSelect = document.getElementById('reg-target-cat');
    if (catSelect) catId = catSelect.value;
    else {
        // Fallback for Edit Mode or other
        const catInput = container.querySelector('[data-field="catId"]');
        if (catInput) catId = catInput.value;
    }

    if (!catId) throw new Error("? ï¸ ?œí—˜ì§€(ì¹´í…Œê³ ë¦¬)ë¥??ë‹¨ ë©”ë‰´?ì„œ ? íƒ?´ì£¼?¸ìš”.");

    let groups = [];

    // Helper to Extract Image Data (Base64) [1MB ì´ˆê³¼ ?´ì¤‘ ë°©ì–´]
    async function extractImg(fileInput, imgPreviewEl) {
        if (fileInput && fileInput.files[0]) {
            const file = fileInput.files[0];
            const MAX_BYTES = 1 * 1024 * 1024; // 1MB

            // [?ˆì „ë§? ? íƒ ?¨ê³„?ì„œ ì°¨ë‹¨?˜ì—ˆ?´ì•¼ ?˜ì?ë§??¹ì‹œ ëª¨ë? ê²½ìš° ?€ë¹?
            if (file.size > MAX_BYTES) {
                throw new Error(`?´ë?ì§€ ?©ëŸ‰ ì´ˆê³¼! 1MB ?´í•˜ ?Œì¼ë§??±ë¡ ê°€?¥í•©?ˆë‹¤. (?„ì¬: ${(file.size/1024/1024).toFixed(1)}MB)`);
            }

            const base64 = await new Promise(r => {
                const reader = new FileReader();
                reader.onload = e => r(e.target.result);
                reader.readAsDataURL(file);
            });
            return { base64: base64.split(',')[1], mimeType: file.type, fileName: file.name };
        }

        // If no new file, check if there's an existing image URL
        const currentImgUrl = (imgPreviewEl && !imgPreviewEl.classList.contains('hidden')) ? imgPreviewEl.querySelector('img')?.src : '';
        // [Fix] Prevent saving of "undefined" string
        if (currentImgUrl === 'undefined' || currentImgUrl === 'null') return null;
        // [Fix] HTML ?´ìš©???´ë?ì§€ URLë¡??¤ì¸?˜ëŠ” ê²?ë°©ì?
        if (currentImgUrl && currentImgUrl.trim().startsWith('<')) return null;
        return currentImgUrl ? { url: currentImgUrl } : null;
    }

    let orphanQuestions = [];

    for (const block of blocks) {
        // [Safety check] Skip nested items if we are iterating the parent
        // Just kidding, querySelectorAll returns flat list. 
        // We need to handle hierarchy. We iterate roots, then find children?
        // Actually, existing logic iterates ALL blocks.
        // We need to distinguish root vs nested.
        // Or cleaner: Iterate Roots, then children.

        // REVISED Loop: only loop root items
        // Wait, 'blocks' contains ALL items.
        // If an item is inside .group-questions-container, it will be processed twice if we are not careful?
        // No, current logic checks type.
        // If type is bundle, it processes nested inside it.
        // If loop hits a nested item, we should SKIP it (because it was handled by parent bundle).

        if (block.closest('.group-questions-container')) continue; // Skip nested items in main loop

        const type = block.getAttribute('data-type');
        const id = block.id;

        if (type === 'bundle' || type === 'passage') {
            const groupId = block.getAttribute('data-group-id') || generateUUID();
            // Use data-field selectors
            const title = block.querySelector('[data-field="title"]')?.value || '';
            const html = stripTwStyles(block.querySelector('[data-field="html"]')?.innerHTML || '');

            const fileInput = block.querySelector('[data-field="file"]');
            const previewEl = block.querySelector('[data-field="preview"]');
            const imgData = await extractImg(fileInput, previewEl);

            // Nested Questions
            const nestedContainer = block.querySelector('.group-questions-container');
            const nestedQuestions = [];
            if (nestedContainer) {
                const qBlocks = nestedContainer.querySelectorAll('.builder-item');
                for (const qBlock of qBlocks) {
                    const qData = await parseQuestionBlock(qBlock);
                    if (qData) nestedQuestions.push(qData);
                }
            }

            groups.push({
                passage: {
                    id: groupId,
                    title: title,
                    text: html,
                    img: imgData?.url || '',
                    imgData: imgData
                },
                questions: nestedQuestions,
                domId: block.id // [Fix] Store DOM ID for linking
            });
        }
        else if (type === 'obj' || type === 'subj') { // Orphan Question
            const qData = await parseQuestionBlock(block);
            if (qData) orphanQuestions.push(qData);
        }
        else if (type === 'img') { // Standalone Image
            const imgId = 'IMG_' + generateUUID();
            const fInput = block.querySelector('[data-field="file"]');
            const previewEl = block.querySelector('[data-field="preview"]');
            const imgData = await extractImg(fInput, previewEl);

            groups.push({
                passage: { id: imgId, title: 'Image Only', text: '', img: imgData?.url || '', imgData: imgData },
                questions: []
            });
        }
    }

    // [Fix] Distribute Linked Orphans to their Bundles
    const trueOrphans = []; // Really orphan questions

    orphanQuestions.forEach(q => {
        // Debug Log
        // console.log(`Checking Orphan ${q.id} linked to ${q.linkedBundleId}`);

        // Find matching bundle group
        // [Fix] Match against domId because linkedBundleId is the DOM Component ID
        // [Fix] Explicit String Conversion for Safety
        const targetGroup = q.linkedBundleId ? groups.find(g => String(g.domId) === String(q.linkedBundleId)) : null;

        if (targetGroup) {
            // console.log(`-> Linked to Group ${targetGroup.passage.id}`);
            targetGroup.questions.push(q);
        } else {
            // console.warn(`-> Orphan (Target Group Not Found)`);
            trueOrphans.push(q);
        }
    });

    // Attach True Orphans to a "General Group"
    if (trueOrphans.length > 0) {
        groups.push({
            passage: { id: generateUUID(), title: 'General', text: '', img: '', imgData: null },
            questions: trueOrphans
        });
    }

    return { catId, commonTitle, groups };

    // --- Helper (Robust) ---
    async function parseQuestionBlock(block) {
        const type = block.getAttribute('data-type');
        if (type !== 'obj' && type !== 'subj') return null;

        const secInput = block.querySelector('[data-field="section"]');
        const subInput = block.querySelector('[data-field="subtype"]'); // Add capture for subtype
        const diffInput = block.querySelector('[data-field="difficulty"]');
        const scoreInput = block.querySelector('[data-field="score"]');
        const titleInput = block.querySelector('[data-field="text"]'); // Question Title
        const contentInput = block.querySelector('[data-field="innerPassage"]'); // Passage Content (Fixed: innerPassage)
        const answerInput = block.querySelector('[data-field="answer"]');
        const modelInput = block.querySelector('[data-field="modelAnswer"]'); // New Field

        // Question Image
        const qFileInput = block.querySelector('[data-field="file"]');
        const qImgPreviewEl = block.querySelector('[data-field="preview"]');
        const qImgData = await extractImg(qFileInput, qImgPreviewEl);

        const q = {
            linkedBundleId: block.getAttribute('data-bundle-id'), // Capture manual link
            id: generateUUID(),
            sec: secInput ? secInput.value : 'ê¸°í?',
            sub: subInput ? subInput.value : 'ê¸°í?', // Use subInput value
            diff: diffInput ? diffInput.value : 'ì¤?,
            type: type === 'obj' ? 'ê°ê??? : 'ì£¼ê???,
            title: titleInput ? titleInput.value : '',
            passageText: contentInput ? stripTwStyles(contentInput.innerHTML) : '', // Collect Passage
            score: scoreInput ? scoreInput.value : 3,
            answer: answerInput ? answerInput.value : '',
            modelAnswer: modelInput ? modelInput.value : '', // Collect Model Answer
            useAiGrading: false,
            choices: [],
            qImg: qImgData?.url || '',
            qImgData: qImgData
        };

        if (type === 'obj') {
            const choices = block.querySelectorAll('[data-field="choice"]');
            choices.forEach(ch => q.choices.push(ch.value));
        }

        return q;
    }
}

// ----------------------------------------------------
// Group Linking & Utility Functions
// ----------------------------------------------------

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let isLinkingMode = false;
let linkingSourceId = null;

function startGroupLinking(sourceId) {
    if (isLinkingMode) return;

    isLinkingMode = true;
    linkingSourceId = sourceId;
    const sourceGroup = document.getElementById(sourceId);
    const groupId = sourceGroup.getAttribute('data-group-id');

    showToast("?”— ?°ê²° ëª¨ë“œ: ?°ê²°??ë¬¸í•­?¤ì„ ?´ë¦­?˜ì„¸?? (ESC to Finish)");

    // Visual Indicators
    sourceGroup.classList.add('ring-4', 'ring-orange-400', 'bg-orange-50');
    sourceGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add Click Listeners to all Question Items
    const items = document.querySelectorAll('.builder-item[data-type="obj"], .builder-item[data-type="subj"]');
    items.forEach(item => {
        item.classList.add('cursor-alias', 'hover:ring-2', 'hover:ring-blue-400', 'transition-all');

        // Save original onclick to restore later? 
        // Actually, we can attach a special click handler that stops propagation
        item.addEventListener('click', handleLinkClick, true); // Capture phase
    });

    // Global Key Listener
    document.addEventListener('keydown', exitLinkingMode);

    // Create Floating Button
    const btn = document.createElement('button');
    btn.id = 'finish-link-btn';
    btn.innerText = "??Linking Done";
    btn.className = "fixed bottom-10 right-10 bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg font-bold animate-bounce z-50 hover:bg-orange-700 transition-colors";
    btn.onclick = () => exitLinkingMode();
    document.body.appendChild(btn);
}

function handleLinkClick(e) {
    if (!isLinkingMode) return;
    e.preventDefault();
    e.stopPropagation();

    const item = e.currentTarget;
    const sourceGroup = document.getElementById(linkingSourceId);
    const groupId = sourceGroup.getAttribute('data-group-id');

    // Update Attribute
    item.setAttribute('data-linked-group', groupId);

    // UI Feedback
    let badge = item.querySelector('.linked-badge');
    if (!badge) {
        // Find header to insert badge
        const header = item.querySelector('h4').parentNode;
        const badgeHtml = document.createElement('span');
        badgeHtml.className = "linked-badge text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded border border-orange-200 ml-2 animate-fade-in";
        badgeHtml.innerText = "?”— Linked";
        header.appendChild(badgeHtml);
    } else {
        // If already linked, maybe flash it
        badge.innerText = "?”— Linked (Updated)";
    }

    // Flash Item
    const originalBg = item.style.backgroundColor;
    item.style.backgroundColor = '#fff7ed'; // orange-50
    setTimeout(() => {
        item.style.backgroundColor = originalBg;
    }, 300);
}

function exitLinkingMode(e) {
    if (e && e.key && e.key !== 'Escape') return;

    isLinkingMode = false;
    linkingSourceId = null;

    // Cleanup Visuals
    document.querySelectorAll('.builder-item').forEach(item => {
        item.classList.remove('ring-4', 'ring-orange-400', 'bg-orange-50', 'cursor-alias', 'hover:ring-2', 'hover:ring-blue-400');
        item.removeEventListener('click', handleLinkClick, true);
    });

    const btn = document.getElementById('finish-link-btn');
    if (btn) btn.remove();

    document.removeEventListener('keydown', exitLinkingMode);
    showToast("???°ê²° ëª¨ë“œ ì¢…ë£Œ");
}

// [Legacy saveRegGroup Removed - Replaced by Integrated Save]



// [Revised] serializeBuilderState using data-fields



// --- PDF Import Logic ---

async function handlePdfImport(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    if (!confirm(`"${file.name}" ?Œì¼??ë¶„ì„?˜ì—¬ ?œí—˜ì§€ë¥??ì„±?˜ì‹œê² ìŠµ?ˆê¹Œ ?\n(?œê°„???¤ì†Œ ?Œìš”?????ˆìŠµ?ˆë‹¤)`)) { // Reset input
        input.value = '';
        return;
    }

    toggleLoading(true);
    try {
        // 1. Convert to Base64
        const base64 = await new Promise(r => {
            const reader = new FileReader();
            reader.onload = e => r(e.target.result.split(',')[1]);
            reader.readAsDataURL(file);
        });

        // 2. Send to GAS (PDF_TO_TEXT)
        const payload = {
            type: 'PDF_TO_TEXT',
            fileName: file.name,
            mimeType: file.type,
            fileData: base64,
            timeout: 300000 // [Modified] 5ë¶?300ì´??¼ë¡œ ?€??ì¦ê? (?œë²„ ?€?„ì•„??ë°©ì?)
        };

        // Use standard fetch here since reliable request might be optimized for DB ops
        // But sendReliableRequest handles retry/auth well.
        const response = await sendReliableRequest(payload);

        if (response.status === 'Success' && response.text) {
            // 3. Fill Split View & Toggle
            const sourceArea = document.getElementById('source-text-area');
            if (sourceArea) {
                sourceArea.value = response.text;
                document.getElementById('source-panel').classList.remove('hidden');
                document.getElementById('btn-split-toggle').classList.remove('hidden');
                // Also enable the actual split view automatically
                toggleSplitView(true);
            }

            parseAndPopulateBuilder(response.text);
            showToast("??PDF ë¶„ì„ ?„ë£Œ!");
        } else {
            throw new Error(response.message || "Unknown Error");
        }

    } catch (e) {
        console.error(e);
        showToast("??PDF ë³€???¤íŒ¨: " + e.message);
    } finally {
        toggleLoading(false);
        input.value = ''; // Reset
    }
}

function parseAndPopulateBuilder(text) {
    // Advanced State Machine Parser (Rev. 3 - Robust)
    const rawLines = text.replace(/[\uFEFF\x00]/g, "").split('\n').map(l => l.trimEnd());

    let blocks = [];
    // State: 0=Passage/None, 1=QuestionTitle, 2=QuestionPassage(Inner), 3=Choices
    let state = 0;

    let currentBlock = { type: 'passage', lines: [] };

    // Pattern: "1.", "Q1", "ë¬¸í•­ 1"
    const qStartRegex = /^(?:Q|Question|ë¬¸í•­)?\s*(\d{1,3})[\.\)]\s*(.*)/i;

    // Pattern: Choices start with (1), ?? [A], 1)
    const choiceRegex = /^[\(\[? â‘¡?¢â‘£?¤â“?‘â“’?“â“”]\s*(\d+|[A-E])?[\)\]\.]?\s+|^\d+[\)]\s+/;

    function flushBlock() {
        if (!currentBlock) return;
        if (currentBlock.type === 'passage') {
            if (currentBlock.lines.join('').trim().length > 0) blocks.push(currentBlock);
        }
        else if (currentBlock.type === 'question') {
            blocks.push(currentBlock);
        }
        currentBlock = null;
    }

    rawLines.forEach((line) => {
        const trLine = line.trim();
        if (!trLine) return;

        const qMatch = trLine.match(qStartRegex);

        // [A] New Question Start
        if (qMatch) {
            flushBlock();
            state = 1; // Title Mode
            currentBlock = {
                type: 'question',
                number: qMatch[1],
                title: qMatch[2] || "",
                innerLines: [],
                rawChoices: []
            };
            return;
        }

        // [B] Choices Start (Transition to state 3)
        if (state >= 1 && (choiceRegex.test(trLine) || trLine.includes('??))) {
            state = 3;
            currentBlock.rawChoices.push(trLine);
            return;
        }

        // [C] Content Handling
        if (state === 0) {
            currentBlock.lines.push(trLine);
        }
        else if (state === 1) {
            // Heuristic: If title gets too long, it's likely an inner passage
            if (currentBlock.title.length > 80 || currentBlock.title.endsWith('?') || currentBlock.title.endsWith(':')) {
                state = 2; // Move to Inner Passage
                currentBlock.innerLines.push(trLine);
            } else {
                currentBlock.title += " " + trLine;
            }
        }
        else if (state === 2) {
            currentBlock.innerLines.push(trLine);
        }
        else if (state === 3) {
            currentBlock.rawChoices.push(trLine);
        }
    });
    flushBlock();

    // --- Render ---
    let processCount = 0;
    blocks.forEach(b => {
        if (b.type === 'passage') {
            const html = b.lines.join('<br>');
            if (html.length > 5) addComponent('bundle', { html }); // Changed to 'bundle'
        }
        else if (b.type === 'question') {
            processCount++;
            const fullChoiceText = b.rawChoices.join(' ');
            const options = parseChoicesSmart(fullChoiceText);
            const isObj = options.length >= 2;

            const data = {
                title: b.title,
                innerPassage: b.innerLines.join('\n'), // New Field
                score: 3, diff: 'ì¤?,
                options: options
            };
            addComponent(isObj ? 'obj' : 'subj', data);
        }
    });

    if (processCount === 0) showToast("? ï¸ ë¬¸ì œë¥?ì°¾ì? ëª»í–ˆ?µë‹ˆ?? ?ìŠ¤???•ì‹???•ì¸?˜ì„¸??");
}

function parseChoicesSmart(text) {
    let clean = text;
    // Replace markers with delimiter
    clean = clean.replace(/[\(? â‘¡?¢â‘£?¤â“?‘â“’?“â“”\d]+[\)\.]?/g, (match) => {
        if (match.match(/^[????/)) return "|||";
        if (match.match(/^\(\d+\)/)) return "|||";
        if (match.match(/^\d+\)/)) return "|||";
        return match;
    });
    const opts = clean.split('|||').map(s => s.trim()).filter(s => s);
    return opts.slice(0, 5);
}



function mapChoices(rawLines) {
    // rawLines might be ["??Apple", "??Banana"] 
    // or ["??Apple ??Banana ..."] mixed?
    // Current parser loop pushed line-by-line.
    // If multiple choices on one line, we missed splitting them.
    // MVP: Just take first 5 if exists.

    // Normalize: remove ??etc.
    return rawLines.slice(0, 5).map(l => l.replace(/^[? â‘¡?¢â‘£??(\)\d\.]+\s*/, ''));
}



// --- Global Error Handler ---
// --- GLOBAL INITIALIZATION ---
// ?±ì´ ë¡œë“œ?˜ë©´ ?¤í–‰??
// 1. ?¤ì • ë¡œë“œ (?µì…˜)
// 2. ì´ˆê¸° ëª¨ë“œ ?¤ì • (?™ìƒ ëª¨ë“œ)


// --- Rich Text & Image Helpers (Shared) ---
// [Updated for Split View Forms]

// --- Image Helper Refactoring (Context Aware) ---
function execCmd(command) {
    document.execCommand(command, false, null);
    const reg = document.getElementById('reg-passage-editor');
    const edit = document.getElementById('edit-passage-editor');
    // Determine which is visible or focused? simpler check:
    // Actually execCmd works on selection, focusing back might lose selection.
    // Let's just focus if nothing is focused.
    if (document.activeElement === reg || document.activeElement === edit) return;

    // Fallback focus
    if (reg && reg.offsetParent) reg.focus();
    else if (edit && edit.offsetParent) edit.focus();
}

function insertSymbol(char) {
    // Check active element first to insert at cursor
    const active = document.activeElement;
    if (active && (active.id === 'reg-passage-editor' || active.id === 'edit-passage-editor' || active.isContentEditable)) {
        document.execCommand('insertText', false, char);
        return;
    }

    // Fallback: append or focus
    const reg = document.getElementById('reg-passage-editor');
    const edit = document.getElementById('edit-passage-editor');
    if (reg && reg.offsetParent) {
        reg.focus();
        document.execCommand('insertText', false, char);
    }
    else if (edit && edit.offsetParent) {
        edit.focus();
        document.execCommand('insertText', false, char);
    }
}

function previewTestImg(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Determine context based on input ID
            const isEdit = input.id.includes('edit');
            // FIX: Ensure we target the PREVIEW box inside the same container
            // Hardcoding ID is risky if duplicated in DOM (which they shouldn't be, but safer to traverse)
            const parent = input.closest('.group') || input.parentElement.parentElement;
            // .group is on the wrapper div. 
            // Let's use ID selector assuming unique IDs for 08-1 and 08-2 logic separation
            // Actually, renderRegForm and renderEditForm might overwrite dynamic-content, so IDs are unique at runtime.

            // But wait! in `renderEditForm`, the preview ID is `test - img - preview`. 
            // In `renderRegForm`, the preview ID is `test - img - preview`.
            // THIS IS OKAY since only one exists at a time.

            const container = document.getElementById('test-img-preview');
            if (container) {
                container.classList.remove('hidden');
                const img = container.querySelector('img');
                if (img) img.src = e.target.result;
            }
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function clearTestImg() {
    const regInput = document.getElementById('reg-passage-img');
    const editInput = document.getElementById('edit-passage-img');

    // Clear both just in case
    if (regInput) regInput.value = '';
    if (editInput) editInput.value = '';

    const container = document.getElementById('test-img-preview');
    if (container) {
        container.classList.add('hidden');
        const img = container.querySelector('img');
        if (img) img.src = ''; // Reset src
    }

    // Crucial: For Edit Mode, we must also clear the internal state if we want to delete image on server.
    // But `updateQuestion` uses `fileData1` or `imgUrl1`. 
    // If we clear preview, does user imply 'Delete Image on Save'?
    // Currently UI just hides it. 
    // We should probably explicitly set a flag or just let `imgUrl1` remaining be handled?
    // If user clears image, we should probably wipe `imgUrl1` in the payload?
    // Let's handle that in `updateQuestion`.
}

/* Legacy Test Canvas & Helpers Removed */



// [Modified] Actual Local Storage Save
// [Old tempSaveReg removed]




function confirmRegCancel() {
    if (confirm("?‘ì„± ì¤‘ì¸ ?´ìš©?€ ?€?¥ë˜ì§€ ?ŠìŠµ?ˆë‹¤. ?˜ê??œê² ?µë‹ˆê¹?")) {
        document.getElementById('app-canvas').classList.remove('!overflow-hidden');
        renderBank();
    }
}


// ============================================================================
// ?˜ì´ì§€ ë¡œë“œ ??ì´ˆê¸°??ë°??´ë¼?°ë“œ ?™ê¸°??
// ============================================================================
document.addEventListener('DOMContentLoaded', async function () {
    console.log('?? Application Initializing...');

    // 1. ?´ë¼?°ë“œ ?¤ì • ?™ê¸°???œë„ (silent mode)
    if (globalConfig.masterUrl) {
        console.log('?ï¸ Attempting cloud sync from:', globalConfig.masterUrl);
        try {
            const syncSuccess = await loadConfigFromCloud(true);
            if (syncSuccess) {
                console.log('??Cloud sync successful');
                applyBranding(); // ë¡œê³  ?ìš©
            } else {
                console.log('? ï¸ Cloud sync failed, using local config');
            }
        } catch (error) {
            console.error('??Cloud sync error:', error);
        }
    } else {
        console.log('? ï¸ Master URL not set, skipping cloud sync');
    }

    // 2. ì´ˆê¸° ?”ë©´ ?Œë”ë§?
    changeMode('initial');

    console.log('??Application Ready');
});


// [Restored Feature] renderStudentLogin
async function renderStudentLogin() {
    const c = document.getElementById('dynamic-content');

    // UI??ì§„ì…?˜ìë§ˆì ë¡œë”© ?œì‹œ ???œë²„?ì„œ ìµœì‹  ?¤ì •(ì¹´í…Œê³ ë¦¬ ëª©ë¡ ?? ?ë™ ?™ê¸°??
    toggleLoading(true);
    await loadConfigFromCloud(true);
    toggleLoading(false);

    // [Fix] ë¡œë”© ?„ë£Œ ???¬ì´?œë°” ?œê±° (changeMode?ì„œ ì¦‰ì‹œ ?œê±° ???ˆì´?„ì›ƒ ê¹¨ì§ ë°©ì?)
    document.body.classList.remove('has-sidebar');

    setCanvasId('02');

    // [Debug] Student Mode Exam List
    console.log("?“ Student Mode Init. Categories:", globalConfig.categories);

    // ì¹´í…Œê³ ë¦¬ê°€ ?†ì–´???”ë©´?€ ?Œë”ë§í•˜?? ? íƒë°•ìŠ¤???ˆë‚´ ?œì‹œ
    const catOptions = (globalConfig.categories && globalConfig.categories.length > 0)
        ? globalConfig.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')
        : `<option value="" disabled selected>? ï¸ ?±ë¡???œí—˜ì§€ê°€ ?†ìŠµ?ˆë‹¤ (${globalConfig.categories ? globalConfig.categories.length : '0'}ê°?</option>`;

    c.innerHTML = `
        <div class="animate-fade-in-safe flex flex-col items-center pb-10 mt-5">
            <div class="canvas-premium-box !max-w-3xl w-full">
                <div class="flex flex-row items-start gap-10">

                    <!-- ì¢Œì¸¡: ?„ì´ì½?+ ?œëª© -->
                    <div class="flex flex-col items-center gap-4 flex-shrink-0 w-40 border-r border-slate-200 pr-10">
                        <div class="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner relative z-10 unified-animate">
                            ?“
                            <div class="absolute inset-0 bg-blue-100/30 rounded-full blur-2xl opacity-50 scale-150 -z-10"></div>
                        </div>
                        <h2 class="fs-18 text-[#013976] uppercase text-center font-black tracking-tight leading-tight">STUDENT LOGIN</h2>
                    </div>

                    <!-- ?°ì¸¡: ??-->
                    <div class="flex-1 space-y-4 text-left">
                        <!-- [1] ?œí—˜ì§€ ? íƒ -->
                        <div>
                            <label class="ys-label font-bold !mb-0">?“‚ ?œí—˜ì§€ ? íƒ</label>
                            <select id="sci" class="ys-field mt-1.5 !bg-slate-50/50 hover:border-blue-400 focus:bg-white transition-all shadow-sm" onchange="handleCategorySelect()">
                                <option value="" disabled selected hidden>?œí—˜ì§€ë¥?? íƒ?˜ì„¸??/option>
                                ${catOptions}
                            </select>
                        </div>

                        <!-- [2] ?™ìƒëª?+ ?™ë…„ -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="ys-label font-bold !mb-0">?“ ?™ìƒëª?/label>
                                <input type="text" id="snm" autocomplete="off" class="ys-field mt-1.5 !bg-slate-50/50 focus:bg-white transition-all shadow-sm" placeholder="?´ë¦„???…ë ¥?˜ì„¸??>
                            </div>
                            <div>
                                <label class="ys-label font-bold !mb-0">?“ ?™ë…„</label>
                                <select id="sgr" class="ys-field mt-1.5 !bg-slate-50/50 focus:bg-white transition-all shadow-sm">
                                    <option value="" disabled selected hidden>?™ë…„??? íƒ?˜ì„¸??/option>
                                    <option value="ì´?">ì´ˆë“± 1?™ë…„</option>
                                    <option value="ì´?">ì´ˆë“± 2?™ë…„</option>
                                    <option value="ì´?">ì´ˆë“± 3?™ë…„</option>
                                    <option value="ì´?">ì´ˆë“± 4?™ë…„</option>
                                    <option value="ì´?">ì´ˆë“± 5?™ë…„</option>
                                    <option value="ì´?">ì´ˆë“± 6?™ë…„</option>
                                    <option value="ì¤?">ì¤‘ë“± 1?™ë…„</option>
                                    <option value="ì¤?">ì¤‘ë“± 2?™ë…„</option>
                                    <option value="ì¤?">ì¤‘ë“± 3?™ë…„</option>
                                    <option value="ê³?">ê³ ë“± 1?™ë…„</option>
                                    <option value="ê³?">ê³ ë“± 2?™ë…„</option>
                                    <option value="ê³?">ê³ ë“± 3?™ë…„</option>
                                </select>
                            </div>
                        </div>

                        <!-- [3] ?‘ì‹œ??+ ?œí—˜?œê°„ -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="ys-label font-bold !mb-0">?“… ?‘ì‹œ??/label>
                                <input type="text" id="sdt" class="ys-field mt-1.5 !bg-slate-50/50 focus:bg-white transition-all shadow-sm" placeholder="? ì§œ ? íƒ">
                            </div>
                            <div>
                                <label class="ys-label font-bold !mb-0">?±ï¸ ?œí—˜ ?œê°„ (ë¶?</label>
                                <input type="number" id="stm" class="ys-field mt-1.5 !bg-slate-50/50 focus:bg-white transition-all shadow-sm" placeholder="0 = ë¬´ì œ?? value="0" min="0">
                            </div>
                        </div>

                        <!-- [4] ë²„íŠ¼ -->
                        <div>
                            <button onclick="startExamSequence()" class="btn-ys w-full !py-4 fs-16 font-bold transition-all active:scale-95 shadow-lg mt-1">
                                ?? START ASSESSMENT NOW
                            </button>
                            <button onclick="goHome()" class="w-full mt-3 text-slate-400 fs-14 underline hover:text-red-500 transition-all font-medium text-center">
                                CANCEL &amp; RETURN
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
    setTimeout(() => {
        document.getElementById('snm')?.focus();
        // Flatpickr ?ìš©
        if (typeof flatpickr !== 'undefined') {
            const updateYearDropdown = (instance) => {
                const yearInput = instance.yearElements[0];
                if (yearInput && yearInput.tagName !== 'SELECT') {
                    if (!yearInput.parentNode) return; // [Fix] parentNode null ë°©ì–´
                    const yearSelect = document.createElement("select");
                    yearSelect.className = "flatpickr-monthDropdown-months !w-auto !m-0";
                    const currentYear = new Date().getFullYear();
                    for (let y = currentYear - 10; y <= currentYear + 10; y++) {
                        const opt = document.createElement("option");
                        opt.value = y;
                        opt.text = y;
                        if (y === instance.currentYear) opt.selected = true;
                        yearSelect.appendChild(opt);
                    }
                    yearSelect.addEventListener("change", (e) => {
                        instance.changeYear(parseInt(e.target.value));
                    });
                    yearInput.parentNode.replaceChild(yearSelect, yearInput);
                } else if (yearInput && yearInput.tagName === 'SELECT') {
                    // ?´ë? ?€?‰íŠ¸ë°•ìŠ¤??ê²½ìš° ê°’ë§Œ ?…ë°?´íŠ¸
                    yearInput.value = instance.currentYear;
                }
            };

            flatpickr("#sdt", {
                locale: "ko",
                dateFormat: "Y-m-d",
                disableMobile: true,
                altInput: true,
                altFormat: "Y-m-d (D)",
                defaultDate: new Date(),
                monthSelectorType: "dropdown",
                onReady: function (selectedDates, dateStr, instance) {
                    updateYearDropdown(instance);
                },
                onMonthChange: function (selectedDates, dateStr, instance) {
                    setTimeout(() => updateYearDropdown(instance), 0);
                },
                onYearChange: function (selectedDates, dateStr, instance) {
                    setTimeout(() => updateYearDropdown(instance), 10);
                },
                onOpen: function (selectedDates, dateStr, instance) {
                    setTimeout(() => updateYearDropdown(instance), 0);
                }
            });
        }
    }, 100);
}

// [Added] ì¹´í…Œê³ ë¦¬ ? íƒ ??ê¶Œì¥ ?™ë…„ ë°??‰ê? ?œê°„ ?ë™?„ì„±
function handleCategorySelect() {
    const sciSelect = document.getElementById('sci');
    if (!sciSelect) return;

    const selectedId = sciSelect.value;
    const cat = globalConfig.categories.find(c => c.id === selectedId);

    if (cat) {
        // ê¶Œì¥ ?‰ê? ?™ë…„ ??–´?°ê¸°
        if (cat.targetGrade) {
            const sgrSelect = document.getElementById('sgr');
            if (sgrSelect) sgrSelect.value = cat.targetGrade;
        }

        // ê¶Œì¥ ?‰ê? ?œê°„ ??–´?°ê¸°
        if (typeof cat.timeLimit !== 'undefined' && cat.timeLimit !== '') {
            const stmInput = document.getElementById('stm');
            if (stmInput) stmInput.value = cat.timeLimit;
        }
    }
}

// [Restored Feature] startExamSequence
async function startExamSequence() {
    const name = document.getElementById('snm').value;
    const grade = document.getElementById('sgr').value;
    const catId = document.getElementById('sci').value;
    const date = document.getElementById('sdt').value || new Date().toISOString().split('T')[0];
    const timeLimit = parseInt(document.getElementById('stm').value) || 0;

    if (!name) return showToast("? ï¸ ?™ìƒ ?´ë¦„???…ë ¥?´ì£¼?¸ìš”.");
    if (!catId) return showToast("? ï¸ ?œí—˜ì§€ë¥?? íƒ?´ì£¼?¸ìš”.");
    if (!grade) return showToast("? ï¸ ?™ë…„?¤ì„ ? íƒ?´ì£¼?¸ìš”.");

    // [Debug & Fix] Data Source Dual Check (globalConfig vs globalData)
    let sourceQuestions = [];
    let sourceName = "";

    if (globalConfig.questions && globalConfig.questions.length > 0) {
        sourceQuestions = globalConfig.questions;
        sourceName = "globalConfig";
    } else if (typeof globalData !== 'undefined' && globalData.questions && globalData.questions.length > 0) {
        sourceQuestions = globalData.questions;
        sourceName = "globalData";
    }

    console.log("Start Exam Debug:", {
        catId,
        configLen: globalConfig.questions ? globalConfig.questions.length : 0,
        dataLen: (typeof globalData !== 'undefined' && globalData.questions) ? globalData.questions.length : 0,
        selectedSource: sourceName
    });

    // [Auto-Fetch] ë¡œì»¬??ë¬¸í•­ ?°ì´?°ê? ?†ìœ¼ë©??´ë¼?°ë“œ ë¹??°ì´?°ì´ê±°ë‚˜ ìºì‹œ ?? œ ?íƒœ?´ë?ë¡??ë™ ë³µêµ¬ë¥??œë„
    let catQuestions = sourceQuestions.filter(q => String(q.catId) === String(catId));

    if (sourceQuestions.length === 0 || catQuestions.length === 0) {
        console.log("?”„ ë¬¸í•­??ë¹„ì–´?ˆì–´ ?´ë¼?°ë“œ?ì„œ ?ë™ ë¡œë”© ?œì‘...");
        showToast("?”„ ?œí—˜ ë¬¸í•­??ë¶ˆëŸ¬?¤ëŠ” ì¤‘ì…?ˆë‹¤...");
        await loadBankQuestions(catId); // ?´ë‹¹ ì¹´í…Œê³ ë¦¬??ë¬¸í•­ë§??œë²„?ì„œ ë¡œë“œ

        // ?ˆë¡œ ë°›ì•„??ë¡œì»¬ ?°ì´??ê°±ì‹ 
        if (globalConfig.questions && globalConfig.questions.length > 0) {
            sourceQuestions = globalConfig.questions;
            sourceName = "globalConfig";
            catQuestions = sourceQuestions.filter(q => String(q.catId) === String(catId));
        }
    }

    // Final Check (?¬ì „???†ìœ¼ë©??¤ì œ ë¹„ì–´?ˆëŠ” ?œí—˜ì§€ë¡?ê°„ì£¼)
    if (catQuestions.length === 0) {
        alert("?š¨ ë¬¸í•­ ?°ì´?°ê? ë¹„ì–´?ˆìŠµ?ˆë‹¤.\n\nê´€ë¦¬ì ëª¨ë“œ?ì„œ ë¬¸í•­(Question Bank Master)??ë¨¼ì? ?±ë¡??ì£¼ì„¸??");
        return;
    }

    // Sync globalConfig if came from globalData
    if (sourceName === "globalData" && (!globalConfig.questions || globalConfig.questions.length === 0)) {
        globalConfig.questions = sourceQuestions;
    }

    // Generate Student ID (Wait for it)
    toggleLoading(true);
    try {
        const studentId = await generateUniqueStudentId(new Date().toISOString(), grade);

        // Set Session
        examSession = {
            studentName: name,
            studentId: studentId, // Add ID to session
            grade: grade,
            categoryId: catId,
            date: date, // User input date
            answers: {},
            startTime: Date.now(),
            isExamActive: true,
            timeLimit: timeLimit // User input time limit
        };

        // Filter Questions
        const filteredQuestions = globalConfig.questions.filter(q => String(q.catId) === String(catId));

        // [Fix] Data Mapping & Bundle Injection
        // Join Bundle Data (Passage/Title) and Normalize Choices
        const mappedQuestions = filteredQuestions.map(q => {
            const copy = { ...q };

            if (copy.setId) {
                const bundle = globalConfig.bundles ? globalConfig.bundles.find(b => b.id === copy.setId) : null;
                if (bundle) {
                    copy.commonTitle = bundle.title;
                    // [Fix] Removed the intentional overwrite to preserve individual single passage inside bundle
                    copy.bundlePassageText = bundle.text; // Better to save it in a separate property if needed elsewhere
                }
            }

            // 2. Normalize Choices (Array -> choice1, choice2...)
            if (Array.isArray(copy.choices)) {
                copy.choices.forEach((c, i) => {
                    copy[`choice${i + 1}`] = c;
                });
            } else if (typeof copy.options === 'string') {
                // Try parsing options string if choices is missing
                try {
                    const parsed = JSON.parse(copy.options);
                    if (Array.isArray(parsed)) {
                        parsed.forEach((c, i) => copy[`choice${i + 1}`] = c);
                    }
                } catch (e) { }
            }

            // 3. Normalize Passage (if independent)

            // 3. Normalize Content
            if (!copy.text || copy.text.trim() === "") {
                copy.text = copy.content || copy.question || copy.title || "No Content";
            }
            if (!copy.passage1 && copy.text && copy.text.length > 300) {
                // Heuristic: Long text might be a passage? 
                // But let's stick to explicit Passage fields.
            }

            return copy;
        });

        console.log(`Filtered Questions: ${mappedQuestions.length} / Total: ${globalConfig.questions.length}`);

        if (mappedQuestions.length === 0) {
            toggleLoading(false);
            const catName = globalConfig.categories.find(c => String(c.id) === String(catId))?.name || catId;
            alert(`? ï¸ '${catName}' ?œí—˜ì§€???±ë¡??ë¬¸í•­???†ìŠµ?ˆë‹¤.\n(? íƒ??ID: ${catId})\n\nê´€ë¦¬ì ?˜ì´ì§€?ì„œ ?´ë‹¹ ?œí—˜ì§€??ë¬¸í•­???±ë¡?˜ì—ˆ?”ì? ?•ì¸?´ì£¼?¸ìš”.`);
            return;
        }

        // Render Exam
        renderExamPaper(mappedQuestions);
        // Start Timer
        startExamTimer(0); // 0 means count up

    } catch (e) {
        console.error(e);
        showToast("???œí—˜ ?œì‘ ì¤??¤ë¥˜ ë°œìƒ");
        alert("?¤ë¥˜ ?ì„¸: " + e.message);
    } finally {
        toggleLoading(false);
    }
}

// [Restored Feature] renderExamPaper
function renderExamPaper(list) {
    // Hide Header/Footer/Sidebar
    const header = document.getElementById('app-header');
    const footer = document.getElementById('app-footer');
    const sidebar = document.getElementById('app-sidebar');
    const mainContainer = document.getElementById('main-container');

    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
    if (mainContainer) {
        mainContainer.style.height = '100vh';
        mainContainer.style.padding = '0';
        mainContainer.style.margin = '0';
        mainContainer.style.maxWidth = 'none';
        mainContainer.style.display = 'block';
    }

    const c = document.getElementById('dynamic-content');
    setCanvasId('02-1', 'full');
    c.className = "w-full h-full bg-slate-50 relative overflow-hidden flex flex-row";

    examSession.currentPage = 0;

    // Grouping Logic
    // Step 1: ?ë³¸ ? ë‹› ?ì„± (bundle/single)
    const rawUnits = [];
    let currentGroup = [];
    let globalDisplayIdx = 1;

    list.forEach(q => q.displayIndex = globalDisplayIdx++);

    list.forEach((q, i) => {
        const prev = list[i - 1];
        const currTitle = String(q.commonTitle || "").trim().toLowerCase();
        let prevTitle = prev ? String(prev.commonTitle || "").trim().toLowerCase() : "";

        if (currTitle !== "" && currTitle === prevTitle) {
            currentGroup.push(q);
        } else {
            if (currentGroup.length > 0) {
                const only = currentGroup[0];
                if (currentGroup.length === 1 && !only.setId && !only.bundlePassageText) rawUnits.push({ type: 'single', data: only });
                else rawUnits.push({ type: 'bundle', data: currentGroup });
            }
            currentGroup = [q];
        }
    });
    if (currentGroup.length > 0) {
        const only = currentGroup[0];
        if (currentGroup.length === 1 && !only.setId && !only.bundlePassageText) rawUnits.push({ type: 'single', data: only });
        else rawUnits.push({ type: 'bundle', data: currentGroup });
    }

    // Step 2: ?˜ì´ì§€ ? ë‹›?¼ë¡œ ?¬êµ¬??(2ë¶„í•  ê³ ì •)
    const pageUnits = [];
    let singleBuffer = [];

    // ë¬¸í•­??"?? ë¬¸í•­?¸ì? ?ë³„ (?´ë?ì§€ ?ˆìŒ or ë°œë¬¸ 1000???´ìƒ)
    function isLargeQuestion(q) {
        if (q.imgUrl && q.imgUrl !== "" && q.imgUrl !== "undefined" && q.imgUrl !== "null") return true;
        const textLen = (q.text || "").length + (q.passage1 || "").length;
        if (textLen >= 1000) return true;
        return false;
    }

    function flushSingles() {
        while (singleBuffer.length > 0) {
            const first = singleBuffer[0];
            if (isLargeQuestion(first)) {
                // ??ë¬¸í•­ ??ë¬´ì¡°ê±??¼ì 1???¬ìš©
                pageUnits.push({ type: 'solo', data: singleBuffer.shift() });
            } else if (singleBuffer.length >= 2) {
                const second = singleBuffer[1];
                if (isLargeQuestion(second)) {
                    // ?¤ìŒ ë¬¸í•­????ë¬¸í•­?´ë©´ ?„ì¬ ë¬¸í•­??solo
                    pageUnits.push({ type: 'solo', data: singleBuffer.shift() });
                } else {
                    // ?????‘ì? ë¬¸í•­ ??pair
                    pageUnits.push({ type: 'pair', data: [singleBuffer.shift(), singleBuffer.shift()] });
                }
            } else {
                // 1ê°œë§Œ ?¨ìŒ ??solo
                pageUnits.push({ type: 'solo', data: singleBuffer.shift() });
            }
        }
    }

    rawUnits.forEach(unit => {
        if (unit.type === 'bundle') {
            flushSingles();
            pageUnits.push(unit); // ë²ˆë“¤?€ 1?˜ì´ì§€ ?„ì²´ ?¬ìš©
        } else {
            singleBuffer.push(unit.data);
        }
    });
    flushSingles();

    examSession.displayUnits = pageUnits;

    const sidebarHtml = renderStudentSidebar();

    c.innerHTML = `
        ${sidebarHtml}
        <div class="flex-1 flex flex-col min-w-0 bg-slate-100/50 relative">
             <div id="exam-scroll-area" class="flex-1 overflow-hidden relative">
                <div id="exam-grid-container" class="w-full h-full transition-all duration-300">
                    <!-- Questions Injected Here -->
                </div>
             </div>
        </div>
    `;

    updateExamGrid(2); // Default to 2 columns
    renderExamContent();
}

// [Restored Feature] renderStudentSidebar - omitted for brevity (unchanged)

// [New] Render Bundle in Split Column (Top: Passage, Bottom: Questions)
// [New] Render Bundle in Split Column (Top: Passage, Bottom: Questions)
// (Consolidated into the function below)
// [New] Render Bundle in Split Column (Top: Passage, Bottom: Questions)
// [Refactored] ë²ˆë“¤ ì¢Œì¸¡ (ì§€ë¬??´ë?ì§€) ?Œë”ë§?
function renderBundleLeft(data) {
    const group = Array.isArray(data) ? data : [data];
    const first = group[0];
    const passage = first.bundlePassageText || "";
    const title = first.commonTitle || "";
    const min = Math.min(...group.map(q => q.displayIndex));
    const max = Math.max(...group.map(q => q.displayIndex));
    const range = (min === max) ? `[${min}]` : `[${min}~${max}]`;

    let bundleImgHtml = "";
    if (first.setId && globalConfig.bundles) {
        const bundle = globalConfig.bundles.find(b => b.id === first.setId);
        const bImg = bundle ? (bundle.imgUrl || bundle.img) : null;
        if (bImg) {
            const safeImg = typeof fixDriveUrl === 'function' ? fixDriveUrl(bImg) : bImg;
            if (safeImg) {
                bundleImgHtml = `<div class="mt-4 mb-2"><img src="${safeImg}" class="w-full h-auto object-contain mx-auto rounded border border-slate-200 shadow-sm bg-white" alt="Bundle Image" loading="lazy"></div>`;
            }
        }
    }

    return `
        ${title ? `<div class="px-0 pb-3 bg-white border-b border-slate-200 flex items-center"><h3 class="font-bold text-slate-700 text-[15px] flex items-center gap-2 m-0 leading-tight"><span class="text-indigo-600 text-[17px] font-bold shrink-0">${range}</span><span>${title}</span></h3></div>` : ''}
        ${passage ? `<div class="mt-3 mb-0 p-4 border border-black rounded shadow-sm bg-white"><div class="prose prose-sm max-w-none text-slate-700 leading-relaxed font-serif text-[15px]">${passage}</div></div>` : ''}
        ${bundleImgHtml}
    `;
}

// [Refactored] ë²ˆë“¤ ?°ì¸¡ (ë¬¸í•­?? ?Œë”ë§?
function renderBundleRight(data) {
    const group = Array.isArray(data) ? data : [data];
    return group.map(q => renderSubQuestion(q)).join('<hr class="border-t border-slate-200 my-8" />');
}

// [Backward Compat] renderSplitBundle ??ê¸°ì¡´ ?¸ì¶œ ?¸í™˜??
function renderSplitBundle(data) {
    return `<div class="flex h-full w-full bg-white"><div class="w-1/2 h-full overflow-y-auto p-6 border-r border-black">${renderBundleLeft(data)}</div><div class="w-1/2 h-full overflow-y-auto p-6">${renderBundleRight(data)}</div></div>`;
}

// [Refactor] Render Sub Question (Seamless Style)
function renderSubQuestion(q) {
    const mediaHtml = getMediaHtml(q);
    const inputHtml = getInputHtml(q);

    let subPassageHtml = "";
    // [Fix] Reverted to ensure individual passage logic ALWAYS works (as requested by user)
    if (q.passage1 && q.passage1.trim() !== "") {
        subPassageHtml = `
            <div class="mb-3 p-3 bg-slate-100/50 border border-black rounded-lg text-[14px] leading-relaxed font-serif text-slate-700">
                ${q.passage1}
            </div>
         `;
    }

    // [Fix] Remove "Card" Style (No shadow/border/bg-white), Just Layout
    return `
        <div class="mb-0">
            <div class="flex items-start gap-3 mb-2">
                 <!-- Number Box -->
                 <div class="flex-shrink-0 w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-[15px] pt-0.5 shadow-sm">
                    ${q.displayIndex}
                 </div>
                 <!-- Question Text (Aligned) -->
                 <h4 class="text-[15px] font-normal text-slate-800 leading-snug pt-0.5 break-keep select-text">${q.text}</h4>
            </div>
            
            <div class="space-y-3 pl-0">
                ${subPassageHtml}
                ${mediaHtml}
                <div class="text-[14px]">
                    ${inputHtml}
                </div>
            </div>
        </div>
    `;
}

// [Refactor] Input HTML (Compact & Grid Choices)
function getInputHtml(q) {
    if (q.type === 'ê°ê???) {
        const choices = [q.choice1, q.choice2, q.choice3, q.choice4, q.choice5].filter(c => c && c.trim() !== "");
        return renderChoices(q, choices);
    } else {
        // Subjective: Compact 1-Line
        const saved = examSession.answers[q.id] || "";
        return `
            <div class="mt-1">
                <textarea 
                    oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'; saveAnswer('${q.id}', this.value)"
                    class="w-full p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-serif text-[14px] leading-relaxed resize-none overflow-hidden min-h-[40px]"
                    rows="1"
                    placeholder="?µì•ˆ???…ë ¥?˜ì„¸??>${saved}</textarea>
            </div>
        `;
    }
}

// [Refactor] Render Choices (2-Col Grid)
function renderChoices(q, choices) {
    const savedAns = examSession.answers[q.id];

    // Check length for layout
    const isLong = choices.some(c => c.length > 25);
    const gridClass = isLong ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";

    return `
        <div class="grid ${gridClass} gap-x-6 gap-y-2">
            ${choices.map((choice, idx) => {
        const num = idx + 1;
        const isChecked = String(savedAns) === String(num) ? 'checked' : '';
        const activeClass = isChecked ? 'text-indigo-700 font-bold' : 'text-slate-700';

        return `
                    <label class="flex items-start gap-2 cursor-pointer p-1 -ml-1 transition-colors">
                        <div class="flex items-center h-5 mt-0.5">
                            <input type="radio" name="q-${q.id}" value="${num}" ${isChecked} onchange="saveAnswer('${q.id}', '${num}')" 
                                   class="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer">
                        </div>
                        <span class="${activeClass} text-[14px] leading-snug hover:text-indigo-600 transition-colors">${choice}</span>
                    </label>
                `;
    }).join('')}
        </div>
    `;
}

// [Refactored] updateExamGrid ????ƒ 2ë¶„í•  ê³ ì •
function updateExamGrid(cols) {
    currentExamGridCols = 2;
    examPageSize = 1; // 1 page unit per page
    renderExamContent();
}

// --- RESTORED MISSING FUNCTIONS ---

// [Restored] getMediaHtml
function getMediaHtml(q) {
    if (!q.imgUrl || q.imgUrl === "undefined" || q.imgUrl === "null") return "";

    // [Fix] Apply Google Drive URL Fixer
    const safeUrl = typeof fixDriveUrl === 'function' ? fixDriveUrl(q.imgUrl) : q.imgUrl;

    return `
        <div class="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img src="${safeUrl}" 
                 class="w-full h-auto max-h-[400px] object-contain mx-auto" 
                 alt="Question Image" 
                 loading="lazy"
                 onerror="this.style.display='none'; if(this.parentElement) this.parentElement.style.display='none';">
        </div>
    `;
}

// [Restored] getInputHtml
/* Overwritten above */

// [Restored] renderChoices
/* Overwritten above */

/* saveAnswer below */
/* setupScrollArrows below */

function saveAnswer(qId, val) {
    examSession.answers[qId] = val;
    updateProgressUI();
    // Auto-save logic if needed
}

// [Restored] setupScrollArrows (Left Side)
function setupScrollArrows() {
    const wrappers = document.querySelectorAll('.custom-scroll-wrapper');
    wrappers.forEach(wrapper => {
        if (wrapper.dataset.hasArrows) return; // Prevent double injection
        const content = wrapper.querySelector('.custom-scrollbar');
        if (!content) return;

        wrapper.dataset.hasArrows = "true";

        // Create Arrows
        const upBtn = document.createElement('button');
        const downBtn = document.createElement('button');

        // Style: Right Side, Floating
        const btnClass = "absolute right-2 z-20 p-2 bg-white/90 rounded-full shadow-lg border border-slate-200 text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all hidden opacity-90 hover:opacity-100 flex items-center justify-center";

        upBtn.className = `${btnClass} top-3 animate-fade-in-safe`;
        downBtn.className = `${btnClass} bottom-3 animate-fade-in-safe`;

        upBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>`;
        downBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>`;

        // Insert
        wrapper.appendChild(upBtn);
        wrapper.appendChild(downBtn);

        // Logic
        const updateArrows = () => {
            const { scrollTop, scrollHeight, clientHeight } = content;
            // Show Up if scrolled down > 10px
            if (scrollTop > 10) upBtn.classList.remove('hidden');
            else upBtn.classList.add('hidden');

            // Show Down if more content exists > 10px
            if (scrollTop + clientHeight < scrollHeight - 10) downBtn.classList.remove('hidden');
            else downBtn.classList.add('hidden');
        };

        content.addEventListener('scroll', updateArrows);
        // Initial Check
        updateArrows();
        // Resize Observer for dynamic content changes
        new ResizeObserver(updateArrows).observe(content);

        // Click Scroll actions
        // Scroll amount: ~150px or 1 item height
        upBtn.onclick = (e) => { e.stopPropagation(); content.scrollBy({ top: -200, behavior: 'smooth' }); };
        downBtn.onclick = (e) => { e.stopPropagation(); content.scrollBy({ top: 200, behavior: 'smooth' }); };
    });
}

// [Removed] fixDriveUrl ì¤‘ë³µ ?•ì˜ ?? œ ??6737ì¤„ì˜ ?ë³¸??ìµœì¢… ?ìš©??


// [Restored] renderQuestionCard (Required for renderExamContent)
function renderQuestionCard(q) {
    return renderSubQuestion(q);
}

// [Merged] renderExamResult ??line 3240 ì°¸ì¡° (ì¤‘ë³µ ?œê±°)



