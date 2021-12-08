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
  
  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: 'did:ethr:rinkeby:0x029bd94319c2d5aa8f360ce875216464044e5d3c05b74a6570edca61ef34e457a3' },
      credentialSubject: {
        id: user.did,
        endpointUrl: 'http://localhost:3000',
        registerAt: '111111111111'
      }
    },
    proofFormat: 'jwt',
    save: false
  })
  // console.log(verifiableCredential)

  let hash =await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
  let vcs = await agent.dataStoreORMGetVerifiableCredentials()
  // console.log(vcs[0].verifiableCredential)
//   // const verifiablePresentation2 = await agent.dataStoreGetVerifiablePresentation({ hash })
  const verifiablePresentation = await agent.createVerifiablePresentation({
    presentation: {
      holder: user.did,
      verifier: [],
      verifiableCredential: [vcs[0].verifiableCredential],
    },
    proofFormat: 'jwt',
    removeOriginalFields: false,
  })
  // console.log(verifiablePresentation)

  // const validated = await agent.validatePresentationAgainstSdr({
  //   presentation: verifiablePresentation,
  //   sdr: {
  //     issuer: '',
  //     claims: [
  //       {
  //         claimType: 'endpointUrl',
  //       },
  //       {
  //         claimType: 'registerAt',
  //       }
  //     ],
  //   },
  // })
  // console.log(validated)
  const resolver = new Resolver(getResolver({ infuraProjectId: INFURA_PROJECT_ID }))
  // console.log(verifiablePresentation)
//   const vcPayload : JwtPresentationPayload = {
//     vp: verifiablePresentation
//   }
  const decoded = decodeJWT(verifiableCredential.proof.jwt)
  // console.log(decoded)
//   const verifiedVP = await verifyPresentation(verifiablePresentation.proof.jwt, resolver)
//   console.log(verifiedVP)
  let jwt = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImVuZHBvaW50VXJsIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwicmVnaXN0ZXJBdCI6IjExMTExMTExMTExMSJ9fSwic3ViIjoiZGlkOmV0aHI6cmlua2VieToweDAzMmU3Y2UyMWU5ODMzOTVmNDJjN2FhNmExZTU5NmM2MmVhN2M3NWIxMGZhOTBkNjEyYWE0MTk4YjExYmQxYmIyMyIsIm5iZiI6MTYzODk0ODEwOCwiaXNzIjoiZGlkOmV0aHI6cmlua2VieToweDAyOWJkOTQzMTljMmQ1YWE4ZjM2MGNlODc1MjE2NDY0MDQ0ZTVkM2MwNWI3NGE2NTcwZWRjYTYxZWYzNGU0NTdhMyJ9.wtDCpibMJjGL35-qDg14c5oD5CRZ64rK7YaSCLr1Yeep54rFcqSZjC3dNInkCsdObrmN-zGifVw-veIOAbRDGQ'
  const verifiedVC = await verifyCredential(jwt, resolver)
  console.log(verifiableCredential.proof.jwt)
}

main().catch(console.log)