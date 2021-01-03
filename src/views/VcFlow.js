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
import {makeStyles} from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Paper from '@material-ui/core/Paper';

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
  const [vc, setVc] = useState("Brak weryfikowalnych poświadczeń");
  const [vp, setVp] = useState("No VP's set");

  const createIssuerAccount = async (password) => {
    const account  = await web3.eth.accounts.create();
    setEthIssuerAddr(account.address);
    setEthrIssuerKey(account.privateKey)
    return ethrIssuerAddr
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

  const verifyVC = async () => {
    const verifiedVC = await verifyCredential(vc, resolver)
    console.log(verifiedVC)
  };
  const verifyVP = async () => {
    const verifiedVC = await verifyPresentation(vp, resolver)
    console.log(verifiedVC)
  };

  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    actionsContainer: {
      marginBottom: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
  }));

  const classes = useStyles();

  function getSteps() {
    return ['Utwórz portfel Issuera', 'Utwórz DID Holdera', 'Wygeneruj weryfikowalne poświadczenie', 'Zweryfikuj poprawność'];
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return <button onClick={createIssuerAccount} > Utwórz portfel Issuera</button>
      case 1:
        return <button onClick={createHoldersAccount} >Utwórz DID Holdera</button>;
      case 2:
        return <button onClick={issueVCS} >Wygeneruj weryfikowalne poświadczenie</button>
      case 3:
        return  <button onClick={verifyVC} >Zweryfikuj poprawność</button>
      default:
        return 'Unknown step';
    }
  }

  return (
    <Container maxWidth="md" >
      <Grid container spacing={4} direction="row" >
        <Grid lg={6}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Typography>{getStepContent(index)}</Typography>
                <div className={classes.actionsContainer}>
                  <div>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      className={classes.button}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      className={classes.button}
                    >
                      {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>Wszystkie kroki zostały wykonane</Typography>
            <Button onClick={handleReset} className={classes.button}>
              Reset
            </Button>
          </Paper>
        )}
        </Grid>
        <Grid md={6}>

        <Typography variant="h6" component="h2" gutterBottom>
          Adres Issuera:
        </Typography>
          <Typography variant="subtitle1" component="h2" gutterBottom>
          <p> { ethrIssuerAddr }</p>
      </Typography>
        <Typography variant="h6" component="h2" gutterBottom>
          Klucz prywatny Issuera:
        </Typography>
        <Typography variant="subtitle1" component="h2" gutterBottom>
          <p> { ethrIssuerKey }</p>
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom>
          DID Holdera:
        </Typography>
        <Typography variant="subtitle1" component="h2" gutterBottom>
          <p> { ethrHolderDID }</p>
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom>
          Weryfikowalne poświadczenie w postaci JWT:
        </Typography>
        <Typography variant="subtitle1"  style={{ wordWrap: "break-word" }}>
          { vc }

        </Typography>
        </Grid>
      </Grid>
      </Container>

  );
};
