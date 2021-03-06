import React, {useRef, useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {
    oppdaterVedtakFattet,
    sendNyHendelseOgOppdaterModel,
    sendPdfOgOppdaterVedtakFattet
} from "../../../redux/actions";
import {HendelseType, Utfall, VedtakFattet} from "../../../types/hendelseTypes";
import {getNow} from "../../../utils/utilityFunctions";
import {FsSaksStatus, FsSoknad, Model} from "../../../redux/types";
import Box from "@material-ui/core/Box";
import {defaultDokumentlagerRef} from "../../../redux/reducer";
import Button from "@material-ui/core/Button";


const useStyles = makeStyles(theme => ({
    root: {
        display: 'inline',
        position: 'relative',
        top: '-5px'
    },
    formControl: {
        '@media (min-width: 860px)': {
            minWidth: 120,
        },
        '@media (max-width: 859px)': {
            minWidth: 40,
        },
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    addbox: {
        margin: theme.spacing(2, 0, 2, 0),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        color: 'inherit'
    },
    fab: {
        marginLeft: theme.spacing(2)
    },
}));

interface OwnProps {
    soknad: FsSoknad,
    sak: FsSaksStatus
}

interface StoreProps {
    model: Model
}

type Props = DispatchProps & OwnProps & StoreProps;


const VedtakFattetModal: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const [vedtakFattetUtfall, setVedtakFattetUtfall] = useState<Utfall|null>(null);
    const {dispatch, soknad, model, sak} = props;
    const inputEl = useRef<HTMLInputElement>(null);

    const handleFileUpload = (files: FileList) => {
        if (files.length !== 1) {
            return;
        }
        const formData = new FormData();
        formData.append("file", files[0], files[0].name);

        sendPdfOgOppdaterVedtakFattet(formData, vedtakFattetUtfall, sak.referanse, model, dispatch);
    };

    return (
        <Box className={classes.addbox}>
            <form className={classes.root} autoComplete="off">
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="age-simple">Utfall</InputLabel>
                    <Select
                        value={vedtakFattetUtfall ? vedtakFattetUtfall : ''}
                        onChange={(evt) => {
                            let value = evt.target.value;
                            if (value === Utfall.INNVILGET
                                || value === Utfall.DELVIS_INNVILGET
                                || value === Utfall.AVSLATT
                                || value === Utfall.AVVIST
                            ) {
                                setVedtakFattetUtfall(value);
                            }
                        }}
                        inputProps={{
                            name: 'saksstatusSelect',
                            id: 'age-simple',
                        }}
                    >
                        <MenuItem key={"vedtakFattetStatusSelect: 0"} value={Utfall.INNVILGET}>Innvilget</MenuItem>
                        <MenuItem key={"vedtakFattetStatusSelect: 1"} value={Utfall.DELVIS_INNVILGET}>Delvis innvilget</MenuItem>
                        <MenuItem key={"vedtakFattetStatusSelect: 2"} value={Utfall.AVSLATT}>Avslått</MenuItem>
                        <MenuItem key={"vedtakFattetStatusSelect: 3"} value={Utfall.AVVIST}>Avvist</MenuItem>
                    </Select>
                </FormControl>
            </form>
            <Button className={classes.fab} variant="contained" color={'default'} onClick={() => {
                     if(model.backendUrlTypeToUse === 'devSbs' && inputEl && inputEl.current) {
                         inputEl.current.click();
                     } else {
                         const nyHendelse: VedtakFattet = {
                             type: HendelseType.VedtakFattet,
                             hendelsestidspunkt: getNow(),
                             saksreferanse: sak.referanse,
                             utfall:  vedtakFattetUtfall ,
                             vedtaksfil: {
                                 referanse: {
                                     type: defaultDokumentlagerRef.type,
                                     id: defaultDokumentlagerRef.id
                                 }
                             },
                             vedlegg: []
                         };

                         sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterVedtakFattet(soknad.fiksDigisosId, nyHendelse));
                     }
                 }}>
                {model.backendUrlTypeToUse === 'devSbs' ? "Send vedtak fattet og velg vedtaksbrev" : "Send vedtak fattet"}
            </Button>
            <input
                id={'inputField vedtakFattet'}
                ref={inputEl}
                onChange={(e) => {
                    if (e.target.files) {
                        handleFileUpload(e.target.files)
                    }
                }}
                onClick={( event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
                    const element = event.target as HTMLInputElement;
                    element.value = '';
                }}
                type="file"
                hidden={true}
                className="visuallyhidden"
                tabIndex={-1}
                accept={window.navigator.platform.match(/iPad|iPhone|iPod/) !== null ? "*" : "application/pdf"}
            />
        </Box>
    );
};

const mapStateToProps = (state: AppState) => ({
    model: state.model
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VedtakFattetModal);
