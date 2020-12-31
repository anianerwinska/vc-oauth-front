import React from 'react';
import './App.css';
// @ts-ignore
import  EthrDID from 'ethr-did'
import Web3 from 'web3'

import { createVerifiableCredentialJwt } from 'did-jwt-vc'

export const IssueVC =  () => {
  const [vc, setVc] = React.useState("");

  const issuer = new EthrDID({
    address: '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198',
    privateKey: 'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75'
  });

  const vcPayload = {
    sub: 'did:ethr:0x435df3eda57154cf8cf7926079881f2912f54db4',
    nbf: Math.floor(Date.now() / 1000),
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        degree: {
          type: 'BachelorDegree',
          name: 'Baccalauréat en musiques numériques'
        }
      }
    }
  };
  const issueVCS = async () => {
    const response = await createVerifiableCredentialJwt(vcPayload, issuer);
    setVc(response);
  };
  return (
    <div>
      <h1>Verifiable Credentials</h1>
      <button onClick={issueVCS}>Issue VC's</button>
      <p>{ vc }</p>
    </div>
  );
};

export const App =  () => {
  return (
   <IssueVC/>
  );
};

export default App;
