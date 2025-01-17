export interface Proposal {
  title: string
  state: string
  endTime: number
}

export type Seed = {
  head: number
  glasses: number
  body: number
  accessory: number
  background: number
}

export interface Auction {
  id: number
  currentBid: String
  bidder: String
  endTime: number
  image: String
  seed: Seed
}

export interface Nouns {
  auction: Auction
  proposals?: Proposal[]
}

export interface ProposalSubgraphEntity {
  id: String
  startBlock: string
  endBlock: string
  status: string
  description: string
}
