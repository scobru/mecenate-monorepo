"use strict";
exports.__esModule = true;
var link_1 = require("next/link");
var scaffold_eth_1 = require("~~/components/scaffold-eth");
var RainbowKitCustomConnectButton_1 = require("~~/components/scaffold-eth/RainbowKitCustomConnectButton");
var outline_1 = require("@heroicons/react/24/outline");
var router_1 = require("next/router");
var scaffold_eth_2 = require("~~/hooks/scaffold-eth");
var react_1 = require("react");
var outline_2 = require("@heroicons/react/24/outline");
var solid_1 = require("@heroicons/react/20/solid");
var utils_js_1 = require("ethers/lib/utils.js");
var NavLink = function (_a) {
    var href = _a.href, children = _a.children;
    var router = router_1.useRouter();
    var isActive = router.pathname === href;
    return (react_1["default"].createElement(link_1["default"], { href: href, passHref: true, className: (isActive ? "bg-secondary shadow-md" : "") + " hover:bg-secondary hover:shadow-md focus:bg-secondary py-2 px-3 text-base font-semibold rounded-full gap-2" }, children));
};
var storage;
if (typeof window !== "undefined") {
    storage = window.localStorage;
}
/**
 * Site header
 */
function Header() {
    var _a = react_1.useState(false), isDrawerOpen = _a[0], setIsDrawerOpen = _a[1];
    var burgerMenuRef = react_1.useRef(null);
    var _b = react_1.useState(false), isLocalStorage = _b[0], setIsLocalStorage = _b[1];
    var _c = react_1.useState(""), verified = _c[0], setVerified = _c[1];
    var _d = react_1.useState(""), encryptedVaultId = _d[0], setEncryptedVaultId = _d[1];
    var _e = react_1.useState(""), withrawalAddress = _e[0], setWithdrawalAddress = _e[1];
    var _f = react_1.useState(""), forwarderAddress = _f[0], setForwarderAddress = _f[1];
    scaffold_eth_2.useOutsideClick(burgerMenuRef, react_1.useCallback(function () { return setIsDrawerOpen(false); }, []));
    react_1.useEffect(function () {
        var _a;
        var verified = localStorage.getItem("verified");
        var sismoData = JSON.parse(localStorage.getItem("sismoData") || "{}");
        if (verified == "verified" && sismoData) {
            setIsLocalStorage(true);
            setVerified(String(verified));
            setEncryptedVaultId(utils_js_1.keccak256(String((_a = sismoData === null || sismoData === void 0 ? void 0 : sismoData.auths[0]) === null || _a === void 0 ? void 0 : _a.userId)));
            if (localStorage.getItem("withdrawalAddress")) {
                setWithdrawalAddress(String(localStorage.getItem("withdrawalAddress")));
            }
            if (localStorage.getItem("forwarderAddress")) {
                setForwarderAddress(String(localStorage.getItem("forwarderAddress")));
            }
        }
    }, [encryptedVaultId]);
    var navLinks = (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("li", { className: "font-semibold" },
            react_1["default"].createElement(NavLink, { href: "/" },
                " ",
                react_1["default"].createElement(outline_2.HomeIcon, { className: "h-4 w-4" }))),
        react_1["default"].createElement("li", { className: "font-semibold" },
            react_1["default"].createElement(NavLink, { href: "/identity" },
                react_1["default"].createElement(outline_2.UserIcon, { className: "h-4 w-4" }),
                "Identity")),
        react_1["default"].createElement("li", { className: "font-semibold" },
            react_1["default"].createElement(NavLink, { href: "/bay" },
                react_1["default"].createElement(outline_2.MegaphoneIcon, { className: "h-4 w-4" }),
                "Bay")),
        react_1["default"].createElement("li", { className: "font-semibold" },
            react_1["default"].createElement(NavLink, { href: "/feeds" },
                react_1["default"].createElement(outline_2.Square3Stack3DIcon, { className: "h-4 w-4" }),
                "Feeds")),
        react_1["default"].createElement("li", { className: "font-semibold" },
            react_1["default"].createElement(NavLink, { href: "/vault" },
                react_1["default"].createElement(outline_1.KeyIcon, { className: "h-4 w-4" }),
                "Vault")),
        react_1["default"].createElement("li", { className: "font-semibold" },
            react_1["default"].createElement(NavLink, { href: "/messenger" },
                react_1["default"].createElement(solid_1.InboxIcon, { className: "h-4 w-4" }),
                "Messenger")),
        react_1["default"].createElement("li", { className: "font-semibold" },
            react_1["default"].createElement(NavLink, { href: "https://scobru.gitbook.io/mecenatedocs/" },
                react_1["default"].createElement(outline_1.DocumentIcon, { className: "h-4 w-4" }),
                "Docs"))));
    return (react_1["default"].createElement("div", { className: "sticky lg:static top-0 navbar bg-primary min-h-0 flex-shrink-0 justify-between z-20 shadow-md lg:shadow-none shadow-secondary" },
        react_1["default"].createElement("div", { className: "navbar-start w-auto lg:w-1/2" },
            react_1["default"].createElement("div", { className: "lg:hidden dropdown", ref: burgerMenuRef },
                react_1["default"].createElement("button", { className: "ml-1 btn btn-ghost " + (isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"), onClick: function () {
                        setIsDrawerOpen(function (prevIsOpenState) { return !prevIsOpenState; });
                    } },
                    react_1["default"].createElement(outline_1.Bars3Icon, { className: "h-1/2" })),
                isDrawerOpen && (react_1["default"].createElement("ul", { tabIndex: 0, className: "menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52", onClick: function () {
                        setIsDrawerOpen(false);
                    } }, navLinks))),
            react_1["default"].createElement("div", { className: "hidden lg:flex items-left gap-2 mx-4 min-w-fit" },
                react_1["default"].createElement("div", { className: "flex flex-col py-2" },
                    react_1["default"].createElement("span", { className: "font-bold  text-4xl" }, " \u2133"))),
            react_1["default"].createElement("ul", { className: "hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2" }, navLinks),
            " "),
        react_1["default"].createElement("div", { className: "navbar-end flex-grow mr-4" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement(scaffold_eth_1.VerifiedBadge, { verified: String(verified), encryptedVaultId: encryptedVaultId, address: forwarderAddress })),
            react_1["default"].createElement(RainbowKitCustomConnectButton_1["default"], null),
            react_1["default"].createElement(scaffold_eth_1.FaucetButton, null))));
}
exports["default"] = Header;
