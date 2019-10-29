import React, {useRef, useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Paper, Theme} from "@material-ui/core";
import {skjulNyDokumentasjonEtterspurtModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {V2Model} from "../../../redux/v2/v2Types";
import TextField from '@material-ui/core/TextField';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {KeyboardDatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import Fab from "@material-ui/core/Fab";
import Typography from "@material-ui/core/Typography";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Hendelse, {
    Dokument,
    DokumentasjonEtterspurt,
    FilreferanseType,
    HendelseType
} from "../../../types/hendelseTypes";
import Grid from "@material-ui/core/Grid";
import {formatDateString, getDateOrNullFromDateString, getNow} from "../../../utils/utilityFunctions";
import {aiuuur, oppdaterDokumentasjonEtterspurt, shakuraaas} from "../../../redux/v3/v3Actions";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import {oHendelser} from "../../../redux/v3/v3Optics";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        paper: {
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
        },
        papertowel: {
            backgroundColor: theme.palette.background.paper,
            width:'80%',
        },
        paperback: {
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(2),
            width:'100%',
            display: 'flex',
            flexwrap: 'wrap',
        },
        paperback2: {
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(2),
            width:'100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexwrap: 'wrap',
        },
        paperbox: {
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
        },
        textField: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
            width:'95%',
        },
        otherField: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
        },
        addbox: {
            margin: theme.spacing(2, 0, 2, 0),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center'
        },
        krav: {
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
        },
        fab: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            margin: theme.spacing(1),
        },
        tablePaper: {
            marginTop: theme.spacing(3),
            overflowX: 'auto',
            marginBottom: theme.spacing(2),
            marginRight: theme.spacing(3),
        },
        table: {
            minWidth: 650,
        },
        paperRoute: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexwrap: 'wrap',
        },
        margin: {
            margin: theme.spacing(1),
        },
    }),
);


interface OwnProps {
    soknad: FsSoknad
}

interface StoreProps {
    visNyDokumentasjonEtterspurtModal: boolean;
    v2: V2Model;
}

type Props = DispatchProps & OwnProps & StoreProps;

const initialDokumentasjonEtterspurt: DokumentasjonEtterspurt = {
    type: HendelseType.DokumentasjonEtterspurt,
    hendelsestidspunkt: '',
    forvaltningsbrev: {
        referanse: {
            type: FilreferanseType.dokumentlager,
            id: ''
        }
    },
    vedlegg: [],
    dokumenter: []
};

const initialDokument: Dokument = {
    dokumenttype: '',
    tilleggsinformasjon: null,
    innsendelsesfrist: null,
};

const NyDokumentasjonEtterspurtModal: React.FC<Props> = (props: Props) => {
    const [modalDokumentasjonEtterspurt, setModalDokumentasjonEtterspurt] = useState<DokumentasjonEtterspurt>(initialDokumentasjonEtterspurt);
    const [modalDokument, setModalDokument] = useState<Dokument>(initialDokument);
    const [visFeilmelding, setVisFeilmelding] = useState(false);
    const [visFeilmeldingDatePicker, setVisFeilmeldingDatePicker] = useState(false);
    const [datePickerIsOpen, setDatePickerIsOpen] = useState(false);
    const classes = useStyles();
    const {visNyDokumentasjonEtterspurtModal, dispatch, v2, soknad} = props;
    const filreferanselager = v2.filreferanselager;
    const inputEl = useRef<HTMLInputElement>(null);

    const handleFileUpload = (files: FileList) => {
        if (files.length !== 1) {
            return;
        }
        const formData = new FormData();
        formData.append("file", files[0], files[0].name);

        dispatch(shakuraaas(soknad.fiksDigisosId, formData, modalDokumentasjonEtterspurt.dokumenter, v2, soknad));
    };

    const leggTilDokument = () => {
        let innsendelsesfristDate = getDateOrNullFromDateString(modalDokument.innsendelsesfrist);
        const nyttDokument: Dokument = {
            dokumenttype: modalDokument.dokumenttype,
            tilleggsinformasjon: modalDokument.tilleggsinformasjon,
            innsendelsesfrist: innsendelsesfristDate ? innsendelsesfristDate.toISOString() : null
        };
        setModalDokumentasjonEtterspurt({...modalDokumentasjonEtterspurt, dokumenter: [...modalDokumentasjonEtterspurt.dokumenter, nyttDokument]});
        setModalDokument({...initialDokument});
    };

    const sendDokumentasjonEtterspurt = () => {
        if((v2.backendUrlTypeToUse === 'q0' || v2.backendUrlTypeToUse === 'q1') && inputEl && inputEl.current
            && modalDokumentasjonEtterspurt.forvaltningsbrev.referanse.id === '') {
            inputEl.current.click();
        } else {
            const nyHendelse: DokumentasjonEtterspurt = {
                type: HendelseType.DokumentasjonEtterspurt,
                hendelsestidspunkt: getNow(),
                forvaltningsbrev: {
                    referanse: {
                        type: filreferanselager.dokumentlager[0].type,
                        id: filreferanselager.dokumentlager[0].id
                    }
                },
                vedlegg: [],
                dokumenter: modalDokumentasjonEtterspurt.dokumenter
            };

            const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

            dispatch(
                aiuuur(
                    soknad.fiksDigisosId,
                    soknadUpdated.fiksDigisosSokerJson,
                    v2,
                    oppdaterDokumentasjonEtterspurt(soknad.fiksDigisosId, nyHendelse)
                )
            );

            setVisFeilmelding(false);
            setVisFeilmeldingDatePicker(false);

            dispatch(dispatch(skjulNyDokumentasjonEtterspurtModal()));
        }
    };

    const makeTableRow = (dokument: Dokument, idx:number) => {
        return <TableRow key={dokument.dokumenttype + dokument.tilleggsinformasjon}>
            <TableCell component="th" scope="row">
                {dokument.dokumenttype}
            </TableCell>
            {dokument.tilleggsinformasjon != null ?
                <TableCell>{dokument.tilleggsinformasjon}</TableCell> :
                <TableCell variant={'footer'}>Ikke utfylt</TableCell>
            }
            {dokument.innsendelsesfrist != null ?
                <TableCell align="right">{formatDateString(dokument.innsendelsesfrist)}</TableCell> :
                <TableCell variant={'footer'} align="right">Ikke utfylt</TableCell>
            }
            <TableCell align="right">
                <IconButton aria-label="delete" onClick={() => {
                    let dokumenter = [...modalDokumentasjonEtterspurt.dokumenter];
                    dokumenter.splice(idx, 1);
                    setModalDokumentasjonEtterspurt({...modalDokumentasjonEtterspurt, dokumenter: dokumenter})
                }}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </TableCell>
        </TableRow>
    };

    const insertDokumentasjonEtterspurtOversikt = () => {

        if (modalDokumentasjonEtterspurt.dokumenter.length > 0) {
            return (
                <Paper className={classes.tablePaper}>
                    <Table className={classes.table} size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Tilleggsinformasjon</TableCell>
                                <TableCell align="right">Innsendelsesfrist</TableCell>
                                <TableCell align="right">Slett krav</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {modalDokumentasjonEtterspurt.dokumenter.map((dokument, idx) => makeTableRow(dokument, idx))}
                        </TableBody>
                    </Table>
                </Paper>
            );
        } else {
            return (
                <>
                    <br/>
                    <Typography variant={"subtitle1"} className={classes.tablePaper}>
                        Ingen dokumenter er lagt til
                    </Typography>
                </>
            )
        }
    };

    function getTextFieldGrid(label: string, value: any, setValue: (v: any) => any, width: 1|2|3|4|5 = 3, required: boolean = false) {
        return <Grid item key={'Grid: ' + label} xs={width} zeroMinWidth>
            <TextField
                id="outlined-name"
                label={label}
                className={classes.textField}
                value={value ? value : ''}
                required={required}
                error={required && visFeilmelding}
                onChange={(evt) => {
                    setValue(evt.target.value);
                    if (required) {
                        if (evt.target.value.length === 0) {
                            setVisFeilmelding(true);
                        } else {
                            setVisFeilmelding(false);
                        }
                    }
                }}
                InputLabelProps={{
                    shrink: true,
                }}
                margin="normal"
                variant="filled"
                autoComplete="off"
            />
        </Grid>;
    }

    function getKeyboardDatePickerGrid(label: string, value: any, setValue: (v: string) => any, isOpen: boolean, setIsOpen: any) {
        return <Grid item key={"grid: " + label} xs={2} zeroMinWidth>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                    className={classes.otherField}
                    disableToolbar
                    required={true}
                    error={visFeilmeldingDatePicker}
                    variant="inline"
                    format="yyyy-MM-dd"
                    margin="normal"
                    id={label}
                    label={label}
                    open={isOpen}
                    onOpen={() => setIsOpen(true)}
                    onClose={() => setIsOpen(false)}
                    value={value}
                    onChange={(date: any) => {
                        setValue(date);
                        setIsOpen(false);
                        setVisFeilmeldingDatePicker(false);
                    }}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                />
            </MuiPickersUtilsProvider>
        </Grid>;
    }

    const fyllInnDokumenterIModalDokumentasjonEtterspurt = () => {
        if (soknad.dokumentasjonEtterspurt) {
            setModalDokumentasjonEtterspurt({...modalDokumentasjonEtterspurt, dokumenter: soknad.dokumentasjonEtterspurt.dokumenter});
        }
    };

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
            open={visNyDokumentasjonEtterspurtModal}
            onRendered={() => fyllInnDokumenterIModalDokumentasjonEtterspurt()}
            onClose={() => dispatch(skjulNyDokumentasjonEtterspurtModal())}
        >
            <Fade in={visNyDokumentasjonEtterspurtModal}>
                <div className={classes.papertowel}>
                    <div className={classes.paperbox}>
                        <div className={classes.paperback}>
                            <Grid container spacing={1} justify="center" alignItems="center">
                                {getTextFieldGrid("Dokumenttype", modalDokument.dokumenttype, (verdi: string) => setModalDokument({...modalDokument, dokumenttype: verdi}), 3, true)}
                                {getTextFieldGrid("Tilleggsinformasjon", modalDokument.tilleggsinformasjon, (verdi: string) => setModalDokument({...modalDokument, tilleggsinformasjon: verdi}), 5)}
                                {getKeyboardDatePickerGrid("Innsendelsesfrist", modalDokument.innsendelsesfrist, (verdi: string) => setModalDokument({...modalDokument, innsendelsesfrist: verdi}),
                                    datePickerIsOpen, setDatePickerIsOpen)}

                                <Grid item key={"grid: legg til dokument"} xs={2} zeroMinWidth>
                                    <Box className={classes.addbox}>
                                        <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                            if (modalDokument.dokumenttype === '') {
                                                setVisFeilmelding(true);
                                            } else if (getDateOrNullFromDateString(modalDokument.innsendelsesfrist) == null) {
                                                setVisFeilmeldingDatePicker(true);
                                            } else {
                                                leggTilDokument();
                                            }
                                        }}>
                                            <AddIcon/>
                                        </Fab>
                                        <Typography>
                                            Legg til dokumentkrav
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </div>
                        <div className={classes.paperback2}>
                            {insertDokumentasjonEtterspurtOversikt()}
                            <Box className={classes.addbox}>
                                <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                    sendDokumentasjonEtterspurt();
                                }}>
                                    <AddIcon/>
                                </Fab>
                                <Typography>
                                    Etterspør dokumentasjon
                                </Typography>
                                <input
                                    id={'inputField vedtakFattet'}
                                    ref={inputEl}
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            handleFileUpload(e.target.files)
                                        }
                                    }}
                                    type="file"
                                    hidden={true}
                                    className="visuallyhidden"
                                    tabIndex={-1}
                                    accept={window.navigator.platform.match(/iPad|iPhone|iPod/) !== null ? "*" : "application/pdf"}
                                />
                            </Box>
                        </div>
                    </div>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyDokumentasjonEtterspurtModal: state.v2.visNyDokumentasjonEtterspurtModal,
    v2: state.v2
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NyDokumentasjonEtterspurtModal);
