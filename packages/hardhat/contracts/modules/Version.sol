// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import {StringsUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";

/// @title Semver
/// @notice A simple contract for managing contract versions.
abstract contract Version {
    // Contract's major version number.
    uint256 public major;

    // Contract's minor version number.
    uint256 public minor;

    // Contract's patch version number.
    uint256 public patch;

    /// @notice Returns the full semver contract version.
    /// @return Semver contract version as a string.
    function version() external view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    StringsUpgradeable.toString(major),
                    ".",
                    StringsUpgradeable.toString(minor),
                    ".",
                    StringsUpgradeable.toString(patch)
                )
            );
    }

    function _version() internal view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    StringsUpgradeable.toString(major),
                    ".",
                    StringsUpgradeable.toString(minor),
                    ".",
                    StringsUpgradeable.toString(patch)
                )
            );
    }
}
