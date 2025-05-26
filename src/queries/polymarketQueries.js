import { gql } from '@apollo/client';

export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    global(id: "") {
      numConditions
      numOpenConditions
      numClosedConditions
      numTraders
      tradesQuantity
      scaledCollateralVolume
      scaledCollateralFees
    }
  }
`;

export const GET_TOP_TRADERS = gql`
  query GetTopTraders {
    accounts(first: 10, orderBy: scaledCollateralVolume, orderDirection: desc) {
      id
      scaledCollateralVolume
      scaledProfit
      numTrades
      creationTimestamp
      lastTradedTimestamp
    }
  }
`;

export const GET_RECENT_TRADES = gql`
  query GetRecentTrades {
    transactions(first: 20, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      type
      user {
        id
      }
      market {
        id
      }
      tradeAmount
      outcomeTokensAmount
      outcomeIndex
    }
  }
`;

export const GET_MARKET_CONDITIONS = gql`
  query GetMarketConditions {
    conditions(first: 10, where: {resolutionTimestamp: null}) {
      id
      outcomeSlotCount
      fixedProductMarketMakers {
        id
        scaledCollateralVolume
        outcomeTokenPrices
        lastActiveDay
        tradesQuantity
      }
    }
  }
`;

export const GET_ORDER_FLOW = gql`
  query GetOrderFlow($timestamp: BigInt!) {
    transactions(
      first: 100
      where: {timestamp_gte: $timestamp}
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      type
      timestamp
      tradeAmount
      outcomeTokensAmount
      user {
        id
      }
    }
  }
`;

export const GET_WHALE_ACTIVITY = gql`
  query GetWhaleActivity {
    transactions(
      first: 20
      where: {tradeAmount_gte: "100000000000"}
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      type
      timestamp
      market {
        id
      }
      user {
        id
        scaledProfit
      }
      tradeAmount
      feeAmount
      outcomeIndex
      outcomeTokensAmount
    }
  }
`;