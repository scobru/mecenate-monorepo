"use strict";
exports.__esModule = true;
exports.useAccountBalance = void 0;
var react_1 = require("react");
var wagmi_1 = require("wagmi");
var store_1 = require("~~/services/store/store");
var scaffold_eth_1 = require("~~/utils/scaffold-eth");
function useAccountBalance(address) {
    var _a = react_1.useState(true), isEthBalance = _a[0], setIsEthBalance = _a[1];
    var _b = react_1.useState(null), balance = _b[0], setBalance = _b[1];
    var price = store_1.useAppStore(function (state) { return state.ethPrice; });
    var configuredChain = scaffold_eth_1.getTargetNetwork();
    var _c = wagmi_1.useBalance({
        address: address,
        watch: true,
        chainId: configuredChain.id
    }), fetchedBalanceData = _c.data, isError = _c.isError, isLoading = _c.isLoading;
    var onToggleBalance = react_1.useCallback(function () {
        setIsEthBalance(!isEthBalance);
    }, [isEthBalance]);
    react_1.useEffect(function () {
        if (fetchedBalanceData === null || fetchedBalanceData === void 0 ? void 0 : fetchedBalanceData.formatted) {
            setBalance(Number(fetchedBalanceData.formatted));
        }
    }, [fetchedBalanceData]);
    return { balance: balance, price: price, isError: isError, isLoading: isLoading, onToggleBalance: onToggleBalance, isEthBalance: isEthBalance };
}
exports.useAccountBalance = useAccountBalance;
