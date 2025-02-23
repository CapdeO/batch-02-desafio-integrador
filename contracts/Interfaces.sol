// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IUniSwapV2Router02 {
    // Conozco la cantidad de tokens B que quiero obtener
    // No sé cuántos tokens A voy a pagar
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountIn(
        uint amountOut, 
        uint reserveIn, 
        uint reserveOut
    ) external pure returns (uint amountIn);

    function getAmountsIn(
        uint amountOut,
        address[] memory path
    ) external view returns (uint256[] memory amounts);
}
