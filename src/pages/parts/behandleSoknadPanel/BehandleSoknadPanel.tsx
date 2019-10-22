import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import SaksOversiktView from "../saksOversiktView/SaksOversiktView";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {getFsSoknadByFiksDigisosId} from "../../../utils/utilityFunctions";
import Paper from "@material-ui/core/Paper";
import SoknadStatusView from "../soknadStatusView/SoknadStatusView";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import Typography from "@material-ui/core/Typography";
import TildeldeltNavkontorView from "../navKontor/TildeltNavKontorView";
import VilkarOversiktView from "../vilkar/VilkarOversiktView";
import DokumentasjonkravOversiktView from "../dokumentasjonskrav/DokumentasjonkravOversiktView";
import RammevedtakOversiktView from "../rammevedtak/RammevedtakOversiktView";


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        // maxWidth: 360,
        // color: 'white',
        // backgroundColor: 'white',
    },
    paper: {
        margin: theme.spacing(2, 0),
        padding: theme.spacing(3, 2),
    },
    col: {

    },
    colJson: {
        marginTop: theme.spacing(2)
    }
}));


interface StoreProps {
    soknad: FsSoknad | undefined;
}

interface BehandleSoknadPanelState {
    input: string;
}

const initialState: BehandleSoknadPanelState = {
    input: ''
};

type Props = DispatchProps & StoreProps;
type State = BehandleSoknadPanelState;


const BehandleSoknadPanel: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);

    const classes = useStyles();

    const {soknad} = props;

    if (soknad) {
        return (
            <div className={classes.root}>

                <Paper className={classes.paper}>
                    <div className={classes.col}>
                        <Typography variant={"h5"} component={"h3"}>
                            Oversikt over søknaden
                        </Typography>
                        <Typography variant={"subtitle1"}>
                            Navn på søker: {soknad.navn}
                        </Typography>
                        <Typography variant={"subtitle1"}>
                            FiksDigisosId: {soknad.fiksDigisosId}
                        </Typography>
                        <TildeldeltNavkontorView soknad={soknad} />
                    </div>

                </Paper>

                <SoknadStatusView soknad={soknad}/>

                <SaksOversiktView soknad={soknad}/>

                <VilkarOversiktView soknad={soknad}/>

                <DokumentasjonkravOversiktView soknad={soknad}/>

                <RammevedtakOversiktView soknad={soknad}/>
            </div>
        );
    }

    return (
        <Paper className={classes.paper}>
            Velg en søknad fra innboksen for å behandle den.
        </Paper>
    )

};

const mapStateToProps = (state: AppState) => {
    const {aktivSoknad} = state.v2;
    const {soknader} = state.v3;
    return {
        soknad: getFsSoknadByFiksDigisosId(soknader, aktivSoknad)
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BehandleSoknadPanel);
