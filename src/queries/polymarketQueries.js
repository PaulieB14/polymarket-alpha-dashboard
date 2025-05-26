import { gql } from '@apollo/client';

// Top traders query
export const GET_TOP_TRADERS = gql`
  query GetTopTraders($first: Int!, $orderBy: String!, $orderDirection: String!) {
    accounts(
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { totalVolume_gt: "1000000" }
    ) {
      id
      totalVolume
      totalProfit
      totalLoss
      netProfit
      tradesCount
      lastTradeTimestamp
      positions {
        id
        outcome
        shares
        averagePrice
      }
    }
  }
`;

// Market data query
export const GET_MARKETS = gql`
  query GetMarkets($first: Int!, $orderBy: String!, $orderDirection: String!) {
    conditions(
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { resolved: false }
    ) {
      id
      question
      volume
      liquidity
      outcomes
      prices
      tradesCount
      lastTradeTimestamp
      marketMaker {
        id
        totalVolume
      }
    }
  }
`;

// Order flow query
export const GET_ORDER_FLOW = gql`
  query GetOrderFlow($first: Int!, $startTime: BigInt!) {
    orderFilleds(
      first: $first
      orderBy: timestamp
      orderDirection: desc
      where: { timestamp_gte: $startTime }
    ) {
      id
      timestamp
      maker
      taker
      makerAssetId
      takerAssetId
      makerAmountFilled
      takerAmountFilled
      price
      isBuy
      condition {
        id
        question
      }
    }
  }
`;

// Account details query
export const GET_ACCOUNT_DETAILS = gql`
  query GetAccountDetails($accountId: ID!) {
    account(id: $accountId) {
      id
      totalVolume
      totalProfit
      totalLoss
      netProfit
      tradesCount
      firstTradeTimestamp
      lastTradeTimestamp
      positions {
        id
        condition {
          id
          question
        }
        outcome
        shares
        averagePrice
        realizedProfit
        unrealizedProfit
      }
      trades(first: 100, orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
        price
        amount
        isBuy
        condition {
          id
          question
        }
      }
    }
  }
`;

// Market inefficiency query
export const GET_MARKET_INEFFICIENCIES = gql`
  query GetMarketInefficiencies($spreadThreshold: BigDecimal!) {
    conditions(
      where: { 
        resolved: false,
        spread_gt: $spreadThreshold
      }
      orderBy: spread
      orderDirection: desc
      first: 20
    ) {
      id
      question
      bestBid
      bestAsk
      spread
      volume
      liquidity
      lastTradeTimestamp
    }
  }
`;