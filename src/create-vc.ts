import { agent } from './veramo/setup'
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
import { decodeJWT } from 'did-jwt'
import { verifyCredential, verifyPresentation, JwtPresentationPayload } from 'did-jwt-vc'
const INFURA_PROJECT_ID = '9273e0d250174b83ad248e75d54375cc'

async function main() {
  const user = await agent.didManagerGetOrCreate({
    alias: 'alice'
  })
  
  // ISSUE VC
  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: 'did:ethr:rinkeby:0x029bd94319c2d5aa8f360ce875216464044e5d3c05b74a6570edca61ef34e457a3' },
      credentialSubject: {
        id: user.did,
        name: 'Oshikawa',
        location: 'Japan'
      }
    },
    proofFormat: 'jwt',
    save: false
  })
  // console.log(verifiableCredential)

  // SAVE VC to DataStore
  let vchash =await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })

  // GET VC from Datastore
  let vcs = await agent.dataStoreORMGetVerifiableCredentials()
  // console.log(vcs[0].verifiableCredential)
  // const verifiablePresentation2 = await agent.dataStoreGetVerifiablePresentation({ hash })

  // CREATE PRESENTATION
  const verifiablePresentation = await agent.createVerifiablePresentation({
    presentation: {
      holder: user.did,
      verifier: [],
      verifiableCredential: [vcs[0].verifiableCredential],
    },
    proofFormat: 'jwt',
    removeOriginalFields: false,
  })

  // SAVE PRESANTATION to DataStore
  const vphash = await agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation })

  // GET PRESANTATION from DataStore
  let vp = agent.dataStoreGetVerifiablePresentation({
    hash: vphash
  })
  console.log(vp)

  // VALDATE VC (Not Verify)
  const validated = await agent.validatePresentationAgainstSdr({
    presentation: verifiablePresentation,
    sdr: {
      issuer: '',
      claims: [
        {
          claimType: 'name',
        },
        {
          claimType: 'location',
        }
      ],
    },
  })
  console.log(validated)

  const resolver = new Resolver(getResolver({ infuraProjectId: INFURA_PROJECT_ID }))
  // const decoded = decodeJWT(verifiableCredential.proof.jwt)

  // VERIFY VC
  const verifiedVC = await verifyCredential(verifiableCredential.proof.jwt, resolver)
  console.log(verifiedVC)
}

main().catch(console.log)