import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {sendNyHendelseOgOppdaterModel, oppdaterFsSaksStatus} from "../../../redux/actions";
import {HendelseType, SaksStatus, SaksStatusType} from "../../../types/hendelseTypes";
import {getNow} from "../../../utils/utilityFunctions";
import {FsSaksStatus, FsSoknad, Model} from "../../../redux/types";


const useStyles = makeStyles(theme => ({
    root: {
        display: 'inline',
        position: 'relative',
        top: '-25px'
    },
    formControl: {
        margin: theme.spacing(1),
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
}));

interface OwnProps {
    soknad: FsSoknad,
    sak: FsSaksStatus
}

interface StoreProps {
    model: Model
}

type Props = DispatchProps & OwnProps & StoreProps;


const EndreSaksstatusModal: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {dispatch, soknad, model, sak} = props;

    return (
        <form className={classes.root} autoComplete="off">
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-simple">Saksstatus</InputLabel>
                <Select
                    value={sak.status ? sak.status : ''}
                    onChange={(evt) => {
                        let value = evt.target.value;
                        if (value === SaksStatusType.UNDER_BEHANDLING
                            || value === SaksStatusType.BEHANDLES_IKKE
                            || value === SaksStatusType.FEILREGISTRERT
                            || value === SaksStatusType.IKKE_INNSYN
                        ) {

                            const nyHendelse: SaksStatus = {
                                type: HendelseType.SaksStatus,
                                hendelsestidspunkt: getNow(),
                                referanse: sak.referanse,
                                tittel: sak.tittel,
                                status: value
                            };

                            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterFsSaksStatus(soknad.fiksDigisosId, nyHendelse));
                        }
                    }}
                    inputProps={{
                        name: 'saksstatusSelect',
                        id: 'age-simple',
                    }}
                >
                    <MenuItem key={"saksstatusSelect: 0"} value={SaksStatusType.UNDER_BEHANDLING}>Under behandling</MenuItem>
                    <MenuItem key={"saksstatusSelect: 1"} value={SaksStatusType.IKKE_INNSYN}>Ikke innsyn</MenuItem>
                    <MenuItem key={"saksstatusSelect: 2"} value={SaksStatusType.FEILREGISTRERT}>Feilregistrert</MenuItem>
                    <MenuItem key={"saksstatusSelect: 3"} value={SaksStatusType.BEHANDLES_IKKE}>Behandles ikke</MenuItem>
                </Select>
            </FormControl>
        </form>
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
)(EndreSaksstatusModal);
