import { Request, Response, NextFunction } from 'express'
import axios, { AxiosResponse } from 'axios'
import { ethers } from 'ethers'
import { ImageData, getNounData } from '@alpsdao/assets'
import { buildSVG } from '@nouns/sdk'
import { shortAddress, shortENS } from '../utils/addressAndENSDisplayUtils'
import { Nouns, Proposal } from '../utils/types'
import { AnkrProvider } from '@ethersproject/providers'
import {
  getProposalEndTimestamp,
  getProposalState,
  getProposalTitle
} from '../utils/proposalHelpers'
import sharp from 'sharp'

const { palette } = ImageData

const url =
  // 'https://api.thegraph.com/subgraphs/name/lilnounsdao/lil-nouns-subgraph'
  'https://api.thegraph.com/subgraphs/name/yanuar-ar/alps-dao'
const query = `
    query NounsData {
      auctions(where: {settled: false}) {
        id,
        noun {
          seed {
            head
            glasses
            body
            accessory
            background
          }
        },
        endTime,
        amount,
        bidder {
          id
        }
      },
      proposals (where: {status_in: [PENDING, ACTIVE]}) {
        id,
        startBlock,
        endBlock,
        status,
        description
      }
    }
  `

const getAlpsData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // get the id from the req
  // let id: string = req.params.id;
  const provider = new AnkrProvider()

  let result: AxiosResponse = await axios.post(url, { query: query })
  const data = result.data.data

  let bidder = '0x00...0000'
  let amount = '0'

  if (data.auctions[0].bidder && data.auctions[0].amount) {
    const ens = await provider.lookupAddress(data.auctions[0].bidder.id)
    bidder = ens ? shortENS(ens) : shortAddress(data.auctions[0].bidder.id)

    amount = data.auctions[0].amount
  }

  const { parts, background } = getNounData(data.auctions[0].noun.seed)
  const svgBinary = buildSVG(parts, palette, background)
  const svgBuffer = Buffer.from(svgBinary)
  const pngBuffer = await sharp(svgBuffer).resize(100).png().toBuffer()
  const image = pngBuffer.toString('base64')

  const blockNumber = await provider.getBlockNumber()

  const proposals = Array<Proposal>()

  for (const prop of data.proposals) {
    const state = getProposalState(blockNumber, prop)

    if (state) {
      proposals.push({
        title: getProposalTitle(prop),
        state: state,
        endTime: getProposalEndTimestamp(blockNumber, state, prop)
      })
    }
  }

  let nounsData: Nouns = {
    auction: {
      id: parseInt(data.auctions[0].id),
      currentBid: ethers.utils.formatEther(amount),
      bidder: bidder,
      endTime: parseInt(data.auctions[0].endTime) * 1000,
      image: image,
      seed: data.auctions[0].noun.seed
    },
    proposals: proposals
  }
  return res.status(200).json(nounsData)
}

export default { getAlpsData }
