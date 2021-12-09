import { agent } from './veramo/setup'
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
import { decodeJWT } from 'did-jwt'
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { verifyCredential, verifyPresentation, JwtPresentationPayload, createVerifiablePresentationJwt } from 'did-jwt-vc'

async function main() {
  const issuer = await agent.didManagerGetOrCreate({
    alias: 'alice'
  })
  const holder = await agent.didManagerGetOrCreate({
    alias: 'brad'
  })
  const verifier = await agent.didManagerGetOrCreate({
    alias: 'camel'
  })
  
  // ISSUE VC
  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: issuer.did },
      credentialSubject: {
        id: holder.did,
        name: 'Oshikawa',
        registerAt:  new Date()
      }
    },
    proofFormat: 'jwt',
    save: false
  })
  console.log(verifiableCredential)


  const verifiablePresentation = await agent.createVerifiablePresentation({
    presentation: {
      holder: holder.did,
      verifier: [verifier.did],
      verifiableCredential: [verifiableCredential],
      type: ['VerifiablePresentation'],
    },
    proofFormat: 'jwt',
  })

  const validated = await agent.validatePresentationAgainstSdr({
    presentation: verifiablePresentation,
    sdr: {
      issuer: '',
      claims: [
        {
          claimType: 'name',
        },
      ],
    },
  })
  console.log(validated)
  console.log(verifiablePresentation)
  console.log(verifiablePresentation.proof.jwt)
  console.log(verifiablePresentation.aud)
  const resolver = new Resolver(getResolver({ infuraProjectId: process.env.INFURA_PROJECT_ID }))
  const verifiedVC = await verifyCredential(verifiableCredential.proof.jwt, resolver)
  console.log(verifiedVC)

  console.log(verifiablePresentation)

  const verifiedVP = await verifyPresentation(verifiablePresentation.proof.jwt, resolver)
  console.log(verifiedVP)

}

main().catch(console.log)