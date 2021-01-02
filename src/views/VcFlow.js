import React, {useCallback, useState} from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { Grid, Button, Container, Accordion, AccordionSummary, Typography, AccordionDetails, TextField } from '@material-ui/core'
import EthrDID from 'ethr-did';
import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  verifyCredential,
  verifyPresentation
} from 'did-jwt-vc';
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'

const testProvider = 'wss://mainnet.infura.io/ws/v3/9ed93dd5e0e841eba23c4e28dbabaf93';
const testProviderApi = 'https://mainnet.infura.io/v3/9ed93dd5e0e841eba23c4e28dbabaf93';
const providerConfig = {
  rpcUrl: testProviderApi,
};
const resolver = new Resolver(getResolver(providerConfig));

const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider || testProvider);


export const VcFlow = () => {
  const [ethrIssuerAddr, setEthIssuerAddr] = useState("");
  const [ethrIssuerKey, setEthrIssuerKey] = useState("");
  const [ethrHolderDID, setEthHolderDID] = useState("");
  const [vc, setVc] = useState("No VC's set");
  const [vp, setVp] = useState("No VP's set");
  //
  // const { register, handleSubmit } = useForm({
  //   defaultValues: {
  //     password: '',
  //   }
  // });
  const createIssuerAccount = async (password) => {
    const account  = await web3.eth.accounts.create();
    setEthIssuerAddr(account.address);
    setEthrIssuerKey(account.privateKey)
  };

  const createHoldersAccount = async (password) => {
    const account  = await web3.eth.accounts.create();
    const did = 'did:ethr:' + account.address;

    setEthHolderDID(did);
  };

  const vcPayload = {
    sub: ethrHolderDID,
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
    const issuer = new EthrDID({
      address: ethrIssuerAddr,
      privateKey: ethrIssuerKey
    });
    const response = await createVerifiableCredentialJwt(vcPayload, issuer);
    setVc(response);

  };

  const createVp = async () => {
    const issuer = new EthrDID({
      address: ethrIssuerAddr,
      privateKey: ethrIssuerKey
    });
    const vpPayload = {
      vp: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        verifiableCredential: [vc]
      }
    }
    const vpJwt = await createVerifiablePresentationJwt(vpPayload, issuer)
    setVp(vpJwt)
  }
  // const onSubmit = useCallback(({ password }) => {
  //   createAccount(password);
  // }, [createAccount]);
  const verifyVC = async () => {
    const verifiedVC = await verifyCredential(vc, resolver)
    console.log(verifiedVC)
  };
  const verifyVP = async () => {
    const verifiedVC = await verifyPresentation(vp, resolver)
    console.log(verifiedVC)
  };
  return (

    <div>
      <h1>Verifiable Credentials sharing flow</h1>

      <button onClick={createIssuerAccount} >Create Issuer's Ethereum Account</button>
      <p>{ ethrIssuerAddr }</p>
      <p>{ ethrIssuerKey }</p>

      <button onClick={createHoldersAccount} >Create Holder's Ethereum DID</button>
      <p>{ ethrHolderDID }</p>
      <button onClick={issueVCS} >Issue VC's</button>
      <p>{ vc }</p>
      <button onClick={createVp} >Create Vp's</button>

      <p>{ vp }</p>
      <button onClick={verifyVC} >Verify Vp's</button>

    </div>
  );
};
