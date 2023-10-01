"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var head_1 = require("next/head");
var outline_1 = require("@heroicons/react/24/outline");
var react_1 = require("react");
var wagmi_1 = require("wagmi");
var utilsContract_1 = require("../components/scaffold-eth/Contract/utilsContract");
var Home = function () {
    var chain = wagmi_1.useNetwork().chain;
    var signer = wagmi_1.useSigner().data;
    var provider = wagmi_1.useProvider();
    var deployedContractIdentity = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateIdentity");
    var deployedContractStats = utilsContract_1.getDeployedContract(chain === null || chain === void 0 ? void 0 : chain.id.toString(), "MecenateStats");
    var _a = react_1["default"].useState(""), globalFee = _a[0], setGlobalFee = _a[1];
    var _b = react_1["default"].useState(""), fixedFee = _b[0], setFixedFee = _b[1];
    var identityAddress = "";
    var identityAbi = [];
    var statsAddress = "";
    var statsAbi = [];
    var _c = react_1["default"].useState([]), stats = _c[0], setStats = _c[1];
    if (deployedContractIdentity) {
        (identityAddress = deployedContractIdentity.address, identityAbi = deployedContractIdentity.abi);
    }
    if (deployedContractStats) {
        (statsAddress = deployedContractStats.address, statsAbi = deployedContractStats.abi);
    }
    var statsCtx = wagmi_1.useContract({
        address: statsAddress,
        abi: statsAbi,
        signerOrProvider: signer || provider
    });
    var getStats = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var stats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (statsCtx === null || statsCtx === void 0 ? void 0 : statsCtx.getStats())];
                case 1:
                    stats = _a.sent();
                    setStats(stats);
                    return [2 /*return*/];
            }
        });
    }); }, [statsCtx]);
    react_1.useEffect(function () {
        getStats();
    }, [getStats, statsCtx]);
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(head_1["default"], null,
            react_1["default"].createElement("title", null, "M E C E N A T E"),
            react_1["default"].createElement("meta", { name: "description", content: "Created with \uD83C\uDFD7 scaffold-eth" }),
            react_1["default"].createElement("link", { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }),
            react_1["default"].createElement("link", { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" }),
            react_1["default"].createElement("link", { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" }),
            react_1["default"].createElement("link", { rel: "manifest", href: "/site.webmanifest" }),
            react_1["default"].createElement("link", { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" }),
            " "),
        react_1["default"].createElement("div", { className: "flex w-full  items-center flex-col rounded-sm " },
            react_1["default"].createElement("div", { className: "w-full p-5 bg-union bg-fixed bg-cover bg-center mx-auto " },
                react_1["default"].createElement("h1", { className: "text-center my-20 " },
                    react_1["default"].createElement("span", { className: "block text-2xl mx-auto bg-base-300 w-fit mb-2" }, "Welcome to"),
                    react_1["default"].createElement("span", { className: "block text-4xl  mx-auto bg-base-300 w-fit lg:text-7xl md:text-6xl sm:text-4xl xl:text-8xl font-bold" }, "\u2133 E C E N A T E")),
                stats ? (react_1["default"].createElement("div", { className: "text-2xl font-semibold rounded-xl text-left my-5  p-2 bg-primary w-fit mx-auto " },
                    react_1["default"].createElement("div", { className: "flex-wrap items-center min-w-fit  lg:text-5xl md:text-4xl text-xl " },
                        react_1["default"].createElement("div", { className: "stats  mx-2 min-w-fit bg-inherit  " },
                            react_1["default"].createElement("div", { className: "stat gap-3" },
                                react_1["default"].createElement("div", { className: "stat-title  lg:text-5xl md:text-4xl text-xl " }, "TREASURY"),
                                react_1["default"].createElement("div", { className: "stat-value lg:text-5xl md:text-4xl text-xl " },
                                    String(Number(Number(stats.treasuryBalance) / 1e18).toFixed(3)),
                                    " ETH"),
                                react_1["default"].createElement("div", { className: "stat-desc  text-base" }, "earned across all fee's product."))),
                        react_1["default"].createElement("div", { className: "stats  mx-2 min-w-fit bg-inherit " },
                            react_1["default"].createElement("div", { className: "stat gap-3 " },
                                react_1["default"].createElement("div", { className: "stat-title font-bold  " }, "FEE"),
                                react_1["default"].createElement("div", { className: "stat-value lg:text-5xl md:text-4xl text-xl" },
                                    String(Number(stats.globalFee) / 10000),
                                    " %"),
                                react_1["default"].createElement("div", { className: "stat-desc text-base" }, " Percent Protocol Fee"))),
                        react_1["default"].createElement("div", { className: "stats  mx-2 min-w-fit bg-inherit" },
                            react_1["default"].createElement("div", { className: "stat gap-3" },
                                react_1["default"].createElement("div", { className: "stat-title font-bold lg:text-5xl md:text-4xl text-xl " }, "TAX"),
                                react_1["default"].createElement("div", { className: "stat-value lg:text-5xl md:text-4xl text-xl " },
                                    " ",
                                    String(Number(stats.fixedFee) / 1e18),
                                    " ETH"),
                                react_1["default"].createElement("div", { className: "stat-desc text-base" }, " Fixed Protocol Tax ")))),
                    react_1["default"].createElement("div", { className: "flex flex-wrap mx-auto items-center gap-2 text-center  lg:flex-row px-5 md:text-3xl text-xl " },
                        react_1["default"].createElement("div", { className: "font-thin my-2 " },
                            "users: ",
                            Number(stats.totalUsers)),
                        react_1["default"].createElement("div", { className: "font-thin my-2 " },
                            "requests: ",
                            Number(stats.totalBayRequests)),
                        " ",
                        react_1["default"].createElement("div", { className: "font-thin my-2 " },
                            "feeds: ",
                            Number(stats.totalFeeds)),
                        " "))) : null),
            react_1["default"].createElement("div", { className: "w-screen bg-sharding bg-cover bg-left" },
                react_1["default"].createElement("div", { className: "xl:w-6/12 md:8/12 lg:10/12 sm:12/12 mx-auto bg-primary opacity-85" },
                    react_1["default"].createElement("div", { className: "p-10 my-20" },
                        react_1["default"].createElement("h2", { className: "text-6xl sm:text-xl font-extrabold  " }, "Getting Started"),
                        react_1["default"].createElement("h2", { className: "text-5xl font-light  " }, "with Mecenate"),
                        react_1["default"].createElement("p", { className: "mb-4 text-2xl font-bold " }, "Follow these steps to begin your journey:"),
                        react_1["default"].createElement("br", null),
                        react_1["default"].createElement("ol", { className: "list-decimal ml-4 px-8 text-2xl font-regular " },
                            react_1["default"].createElement("li", null, "Navigate to the \"Identity\" section"),
                            react_1["default"].createElement("li", null, "Connect with Sismo to generate your Zero-Knowledge Proof (ZKP)"),
                            react_1["default"].createElement("li", null, "Log into the Mecenate Protocol"),
                            react_1["default"].createElement("li", null, "Set up your seller feed or browse requests in the marketplace")))),
                react_1["default"].createElement("div", { className: "max-w-3xl bg-primary opacity-95 p-10 flex-col mx-auto text-center  text-base-content" },
                    react_1["default"].createElement("h1", { className: "text-7xl font-extrabold mb-20" }, "Data Privacy and Security"),
                    react_1["default"].createElement("h1", { className: "text-3xl font-extralight mb-20" }, "Redefined."),
                    react_1["default"].createElement("p", { className: "text-3xl mb-20 font-extralight text-left hover:font-semibold hover:text-base-content" },
                        react_1["default"].createElement("strong", null, "Mecenate Feeds "),
                        " allows me to securely and privately post my information and receive payments directly from interested parties without any intermediaries."),
                    react_1["default"].createElement("p", { className: "text-2xl mb-8 font-thin text-left hover:text-base-content" }, "With Mecenate Protocol, I can be confident that my information is protected and that I'm getting fair compensation for it."))),
            react_1["default"].createElement("div", { className: "min-w-fit mx-auto text-center my-20 text-base-content" },
                react_1["default"].createElement("h1", { className: "text-6xl font-bold" }, "Request"),
                react_1["default"].createElement("div", { className: "content-slider w-52 " },
                    react_1["default"].createElement("div", { className: "slider" },
                        react_1["default"].createElement("div", { className: "mask" },
                            react_1["default"].createElement("ul", null,
                                react_1["default"].createElement("li", { className: "anim1" },
                                    react_1["default"].createElement("div", { className: "quote" }, "Secrets Code"),
                                    react_1["default"].createElement("div", { className: "quote" }, "Technical Assistance"),
                                    react_1["default"].createElement("div", { className: "quote" }, "Clean Data"),
                                    react_1["default"].createElement("div", { className: "source" }, "- Fair")),
                                react_1["default"].createElement("li", { className: "anim2" },
                                    react_1["default"].createElement("div", { className: "quote" }, "Personalized Tutorials."),
                                    react_1["default"].createElement("div", { className: "quote" }, "Custom Artwork"),
                                    react_1["default"].createElement("div", { className: "quote" }, "Video Proof"),
                                    react_1["default"].createElement("div", { className: "source" }, "- Unstoppable")),
                                react_1["default"].createElement("li", { className: "anim3" },
                                    react_1["default"].createElement("div", { className: "quote" }, "Private Keys"),
                                    react_1["default"].createElement("div", { className: "quote" }, "Hiring Reccomandation"),
                                    react_1["default"].createElement("div", { className: "quote" }, "Cryptopunks"),
                                    react_1["default"].createElement("div", { className: "source" }, "- Censorship-Proof")),
                                react_1["default"].createElement("li", { className: "anim4" },
                                    react_1["default"].createElement("div", { className: "quote" }, "Dank Memes"),
                                    react_1["default"].createElement("div", { className: "quote" }, "Paywalled Content"),
                                    react_1["default"].createElement("div", { className: "quote" }, "Homework Solutions"),
                                    react_1["default"].createElement("div", { className: "source" }, "- Decentralized")),
                                react_1["default"].createElement("li", { className: "anim5" },
                                    react_1["default"].createElement("div", { className: "quote" }, "Unique Dataset"),
                                    react_1["default"].createElement("div", { className: "quote" }, "State Secrets"),
                                    react_1["default"].createElement("div", { className: "quote" }, "Sourdough Recipe"),
                                    react_1["default"].createElement("div", { className: "source" }, "- Anonymous")))))),
                react_1["default"].createElement("p", { className: "text-xl mb-8" }, "Lock up a cryptocurrency reward. Anyone can respond. Destroy their stake if you don't get what you want.")),
            react_1["default"].createElement("div", { className: "w-screen p-5 bg-primary" },
                react_1["default"].createElement("div", { className: "flex p-5 flex-col items-center text-center py-10 xl:w-6/12 md:8/12 lg:10/12 sm:12/12 mx-auto bg-primary opacity-95 " },
                    react_1["default"].createElement(outline_1.MegaphoneIcon, { className: "h-20 w-20 fill-secondary" }),
                    react_1["default"].createElement("div", { className: "p" },
                        react_1["default"].createElement("div", { className: "font-base align-baseline text-justify-center my-5" },
                            react_1["default"].createElement("ul", null,
                                react_1["default"].createElement("div", { className: "text-6xl font-extrabold mb-5" }, "BAY")),
                            react_1["default"].createElement("br", null),
                            react_1["default"].createElement("ul", { className: "text-xl font-light" },
                                "An open marketplace for information of any kind. It can be used to create credible signals over possession of local knowledge and attract a buyer willing to pay for it.",
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("strong", null, "Mecenate BAY"),
                                " is build on top of:",
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement("br", null),
                                react_1["default"].createElement(outline_1.Square3Stack3DIcon, { className: "h-8 w-8 fill-secondary mx-auto" }),
                                react_1["default"].createElement("strong", null, "Mecenate FEEDS")),
                            react_1["default"].createElement("br", null))))),
            react_1["default"].createElement("div", { className: "w-screen  bg-bazaar bg-cover bg-center " },
                react_1["default"].createElement("div", { className: "flex flex-col xl:w-6/12 md:8/12 lg:10/12 sm:12/12  p-10  text-left  my-5  bg-primary opacity-95 mx-auto" },
                    react_1["default"].createElement("h1", { className: "text-4xl font-extrabold mb-8 text-left " }, "INFORMATIONS FINDS YOU \uD83D\uDD2E"),
                    react_1["default"].createElement("p", { className: "text-2xl  mb-8" },
                        " ",
                        "Lock up a cryptocurrency reward. Anyone in the world can fulfill it. They must stake cryptocurrency and upload a file containing the requested information."),
                    react_1["default"].createElement("p", { className: "text-3xl  mb-8" }, "Release the reward if you are satisfied with the upload. Destroy their stake if you are dissatisfied \uD83D\uDD25"),
                    react_1["default"].createElement("p", { className: "text-2xl  mb-8" }, "Mecenate Bay is decentralized, encrypted, and unstoppable. All requests are public."),
                    react_1["default"].createElement("h2", { className: "text-2xl font-semibold mb-4" }, "Make a request \uD83D\uDCE3"))),
            react_1["default"].createElement("div", { className: "backdrop-opacity-50 backdrop-blur-2xl bg-dev bg-cover " },
                react_1["default"].createElement("div", { className: "flex-grow mx-auto xl:w-6/12 md:8/12 lg:10/12 sm:12/12  py-12 p-10 bg-primary opacity-95" },
                    react_1["default"].createElement("div", { className: "text-5xl font-bold my-10" }, "HOW IT WORKS?"),
                    react_1["default"].createElement("p", { className: "text-xl  mb-8" },
                        react_1["default"].createElement("strong", null, "Question"),
                        " Enter a short explanation of what you're looking for. This can include links, Twitter handles and hastags. Make your descriptions as clear as possible."),
                    react_1["default"].createElement("p", { className: "text-xl  mb-8" },
                        react_1["default"].createElement("strong", null, "Reward"),
                        " An amount of ETH cryptocurrency you are locking up as a reward. This will be transferred into an escrow when you make the request, you make sure you have this in your wallet. Like this fulfillers can see you really have the money and will take your request seriously. (Once someone fulfills your request it is added to their stake and you will not get it back, you can only punish it.)"),
                    react_1["default"].createElement("p", { className: "text-xl  mb-8" },
                        react_1["default"].createElement("strong", null, "Fulfiller"),
                        " stake This is what makes Mecenate Bay powerful. This is how much ETH cryptocurrency someone will need to deposit when fulfilling your request. You can destroy a fraction or all of their staked money if you are dissatisfied with what they provide. This will stop people responding with spam or bad information. It usually makes sense to have this be roughly 10% - 50% of the reward."),
                    react_1["default"].createElement("p", { className: "text-xl  mb-8" },
                        react_1["default"].createElement("strong", null, " Punish ratio"),
                        " How many ETH it will cost you to destroy one dollar of the fulfiller's stake. For example; if you set the ratio to 0.1 and punish a fulfiller who staked 100 ETH, it will cost you 10 ETH to destroy their entire stake. This protects the fulfiller from reckless punishment. The default value is good for most requests."),
                    react_1["default"].createElement("p", { className: "text-xl  mb-8" },
                        react_1["default"].createElement("strong", null, "Punish period"),
                        " How many days after your request is fulfilled you have to verify the quality of the information provided. Within this window, you may punish the fulfiller. After this time their stake and reward are released. You may decide to release it early if you are satisfied with the submission. The default value is good for most requests."))))));
};
exports["default"] = Home;
