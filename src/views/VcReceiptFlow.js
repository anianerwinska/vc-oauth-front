import React, {useState} from 'react';
import Confetti from 'react-dom-confetti';
import {Grid, Button, Container, Typography, TextField} from '@material-ui/core'
import EthrDID from 'ethr-did';
import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  verifyCredential,
  verifyPresentation
} from 'did-jwt-vc';
import {Resolver} from 'did-resolver'
import {getResolver} from 'ethr-did-resolver'
import {makeStyles} from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';

const testProvider = 'wss://mainnet.infura.io/ws/v3/9ed93dd5e0e841eba23c4e28dbabaf93';
const testProviderApi = 'https://mainnet.infura.io/v3/9ed93dd5e0e841eba23c4e28dbabaf93';
const providerConfig = {
  rpcUrl: testProviderApi,
};
const resolver = new Resolver(getResolver(providerConfig));

const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider || testProvider);


export const VcReceiptFlow = () => {
  const [ethrIssuerAddr, setEthIssuerAddr] = useState("");
  const [ethrIssuerKey, setEthrIssuerKey] = useState("");
  const [vc, setVc] = useState("Brak weryfikowalnych poświadczeń");
  const [vp, setVp] = useState("Brak weryfikowalnych prezentacji");

  const [vcCorrect, setVcCorrect] = useState(false);
  const [issuerSetup, setIssuerSetup] = useState("");
  const [holderSetup, setHolderSetup] = useState("");
  const [holderInstance, setHolderInstance] = useState("");

  const [holderEmail, setHolderEmail] = useState("");
  const [receiptEncrypted, setReceiptEncrypted] = useState("");
  const [checked, setChecked] = useState(false);

  const [vcType, setVcType] = useState("");
  const [vcName, setVcName] = useState("");
  const [ethrHolderDID, setEthHolderDID] = useState("");
  const [decryptedReceipt, setDecryptedReceipt] = useState("")

  const receiptSchema = {
    dokument: {
      naglowek: {
        wersja: "JPK_KASA_PARAGON_v1-0",
        dataJPK: "2020-04-10T04:23:45.678Z"
      },
      podmiot1: {
        nazwaPod: "Nazwa podmiotu",
        nrFabr: "WTE2001000009",
        NIP: "6970000802",
        adresPod: {
          ulica: "Ulica",
          miejsc: "Miejscowosc",
          nrLok: "NrLok",
          poczta: "Poczta",
          nrDomu: "NrDomu",
          kodPoczt: "00-000"
        },
        nrUnik: "WTE2001000009",
        nrEwid: "2020/000001612"
      },
      paragon: {
        JPKID: 4,
        pamiecChr: 1,
        nrDok: 3,
        pozycja: [
          {
            towar:
              {
                brutto: 1230,
                cena: 1230,
                idStPTU: "A",
                ilosc: "1",
                nazwa: "Nazwa towaru 1",
                oper: false
              }
          },
          {
            towar:
              {
                brutto: 1000,
                cena: 1000,
                idStPTU: "G",
                ilosc: "1",
                nazwa: "Nazwa towaru 2",
                oper: false
              }
          }
        ],
        stPTU: [
          {
            id: "A",
            wart: 2300
          },
          {
            id: "G",
            wart: "ZW"
          }
        ],
        podsum: {
          sumaNetto:
            [
              {
                idStPTU: "A",
                brutto: 1230,
                vat: 230
              },
              {
                idStPTU: "G",
                brutto: 1000,
                vat: 0
              }
            ],
          sumaPod: 230,
          sumaBrutto: 2230,
          waluta: "PLN"
        },
        total:
          {
            zaplZwrot: 2230
          },
        nrParag: 1,
        nrKasy: "001",
        zakSprzed: "2020-04-10T04:23:45.678Z",
        kasjer: "Kasjer"
      }
    }
  };

  const vcPayload = {
    sub: ethrHolderDID,
    nbf: Math.floor(Date.now() / 1000),
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        type: vcType,
        name: vcName,
        digitalReceiptAgree: checked

      }
    }
  };
  const CryptID = require('@cryptid/cryptid-js');


  const createIssuerAccount = async () => {
    const account = await web3.eth.accounts.create();
    setEthIssuerAddr(account.address);
    setEthrIssuerKey(account.privateKey);
    const instance = await CryptID.default.getInstance();
    const setupResult = instance.setup(CryptID.default.SecurityLevel.LOW);
    setIssuerSetup(JSON.stringify(setupResult, 2, " "));
    return ethrIssuerAddr
  };

  const createHoldersAccount = async (password) => {
    const account = await web3.eth.accounts.create();
    const did = 'did:ethr:' + account.address;
    setEthHolderDID(did);
    const result = await encryptReceipt();
    setReceiptEncrypted(JSON.stringify(result, 2, " "))
  };

  const encryptReceipt = async () => {
    const instance = await CryptID.default.getInstance();
    const setupResult = instance.setup(CryptID.default.SecurityLevel.LOW);
    setHolderSetup(JSON.stringify(setupResult, 2, " "));
    setHolderInstance(instance);
    return instance.encrypt(setupResult.publicParameters, holderEmail, JSON.stringify(receiptSchema));
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
    };
    const vpJwt = await createVerifiablePresentationJwt(vpPayload, issuer)
    setVp(vpJwt)
  };

  const verifyVC = async () => {
    try {
      const verifiedVC = await verifyCredential(vc, resolver);
      const holderSetupToJson = JSON.parse(holderSetup);
      const receiptEncryptedToJson = JSON.parse(receiptEncrypted);
      console.log(holderSetupToJson)
      const extractResult = holderInstance.extract(holderSetupToJson.publicParameters, holderSetupToJson.masterSecret, holderEmail);
      console.log(extractResult)
      const decryptResult = holderInstance.decrypt(holderSetupToJson.publicParameters, extractResult.privateKey, receiptEncryptedToJson.ciphertext);
      console.log(decryptResult)
      if (vcPayload.vc.credentialSubject.digitalReceiptAgree === true) {
        alert("Poświadczenie poprawne");
      }
      else {
        alert("Użytkownik nie wyraził zgody na otrzymywanie e-paragonow");

      }
      if (decryptResult.success) {
        setVcCorrect(true);
        const asJSON = JSON.parse(decryptResult.plaintext)
        setDecryptedReceipt(JSON.stringify(asJSON, 2, " "))
      }

    } catch (e) {
      console.log(e)
      alert("Wystąpił błąd, poświadczenie niepoprawne");
    }
  };

  const config = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    perspective: "500px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
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
    setEthIssuerAddr("");
    setEthrIssuerKey("");
    setHolderSetup("");
    setReceiptEncrypted("");
    setVcType("");
    setVcName("");
    setEthHolderDID("");
    setDecryptedReceipt("");
    setVcCorrect(false);
    setVp("");
    setVc("");
    setHolderEmail("");
    setHolderInstance("");
    setIssuerSetup("");

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
    return ['Utwórz portfel Issuera', 'Utwórz DID Holdera', 'Zaszyfruj paragon', 'Wygeneruj weryfikowalne poświadczenie',
      'Wygeneruj weryfikowalną prezentacje', 'Zweryfikuj poprawność'];
  }

  const issuerStep = () => {
    return (
      <Container>
        <button onClick={createIssuerAccount}> Utwórz portfel Issuera</button>
        <br/>
        <br/>
        <Typography variant="button" component="h2" gutterBottom>
          Adres Issuera:
        </Typography>
        <Typography variant="subtitle1" component="h2" gutterBottom>
          <p> {ethrIssuerAddr}</p>
        </Typography>
        <Typography variant="button" component="h2" gutterBottom>
          Klucz prywatny Issuera:
        </Typography>
        <Typography variant="subtitle1" component="h2" gutterBottom>
          <p> {ethrIssuerKey}</p>
        </Typography>

        <Typography variant="button" component="h2" gutterBottom>
          IBE Issuera:
        </Typography>
        <Typography variant="subtitle1" component="h2" gutterBottom>
          <pre>  {issuerSetup} </pre>
        </Typography>
      </Container>
    )
  };
  const handleCheckboxChange = (event) => {
    setChecked(event.target.checked);
  };
  const vcIssueStep = () => {
    return (
      <Container>
        <Checkbox
          checked={checked}
          onChange={handleCheckboxChange}
          color="primary"
          inputProps={{ 'aria-label': 'primary checkbox' }}
        />
        Wyrażam zgodę nas otrzymywanie paragonu na powiązany identyfikator DID:
        <p>{ethrHolderDID}</p>
        <br/>


        <Typography variant="body1" gutterBottom>
          Podaj parametry weryfikowalnego poświadczenia: <br/> jego typ (np. degree) oraz nazwa np. (dyplom ukończenia
          studiow)
        </Typography>
        <br/>
        <Grid direction="column">
          <TextField
            type="text"
            label="Typ"
            value={vcType}
            onChange={e => setVcType(e.target.value)}
          />
          <br/>
          <TextField
            type="text"
            label="Nazwa"
            value={vcName}
            onChange={e => setVcName(e.target.value)}
          />
          <br/>
          <br/>

          <button onClick={issueVCS}>Wygeneruj weryfikowalne poświadczenie</button>

          <Typography variant="button" component="h2" gutterBottom>
            Weryfikowalne poświadczenie:
            <br/>

          </Typography>
          <Typography variant="subtitle1" style={{wordWrap: "break-word"}}>
            <pre> {JSON.stringify(vcPayload, null, 2)} </pre>
          </Typography>
          <Typography variant="button" component="h2" gutterBottom>
            Weryfikowalne poświadczenie w postaci JWT:
          </Typography>
          <Typography variant="subtitle1" style={{wordWrap: "break-word"}}>
            {vc}
          </Typography>
          <br/>
          <br/>

        </Grid>

      </Container>
    )
  };

  const vcHolderStep = () => {
    return (
      <Container>
        <Grid>
        <Typography variant="button" component="h2" gutterBottom>
          Podaj email holdera
        </Typography>
        </Grid>

        <Grid direction="column">
          <TextField
            type="text"
            label="Email"
            value={holderEmail}
            onChange={e => setHolderEmail(e.target.value)}
          />
          <br/>
          <button onClick={createHoldersAccount}>Utwórz DID holdera</button>
          <br/>
          <Typography variant="button" component="h2" gutterBottom>
            DID Holdera:
          </Typography>
          <Typography variant="subtitle1" component="h2" gutterBottom>
            <p> {ethrHolderDID}</p>
          </Typography>
          <br/>
        </Grid>
      </Container>
    )
  }
  const vcReceiptStep = () => {
    return (
      <Container>
        <Typography variant="button" component="h2" gutterBottom>
          Paragon - schemat
        </Typography>
        <Typography variant="subtitle1" cstyle={{overflowWrap: "break-all"}}>

          <pre>{JSON.stringify(receiptSchema, 2, " ")}</pre>
        </Typography>
        <Typography variant="button" component="h2" gutterBottom>
          IBE Holdera utworzone w oparciu o podany email:
        </Typography>
        <Typography variant="subtitle1" component="h2" gutterBottom>
          <pre>  {holderSetup} </pre>
        </Typography>
        <Typography variant="button" component="h2" gutterBottom>
          Zaszyfrowany paragon przy użyciu IBE
        </Typography>
        <Typography variant="subtitle1" cstyle={{overflowWrap: "break-all"}}>

          <pre>{receiptEncrypted}</pre>
        </Typography>
        <br/>
      </Container>
    )
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return issuerStep();
      case 1:
        return vcHolderStep();
      case 2:
        return vcReceiptStep();
      case 3:
        return vcIssueStep();
      case 4:
        return (
          <Container>
            <button onClick={createVp}> Wygeneruj weryfikowalną prezentacje</button>
            <Typography variant="subtitle1" style={{wordWrap: "break-word"}}>

            <p>{vp}</p>
            </Typography>
          </Container>
        )
      case 5:
        return (
          <Container>
            <button onClick={verifyVC}> Zweryfikuj poprawność</button>
            <Confetti active={vcCorrect} config={config}/>

            <Typography variant="button" component="h2" gutterBottom>
              Odszyfrowany paragon
            </Typography>
            <pre> {decryptedReceipt} </pre>
          </Container>
        )
      default:
        return 'Unknown step';
    }
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={12} direction="column">
        <Grid lg={12}>
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
      </Grid>
    </Container>

  );
};
