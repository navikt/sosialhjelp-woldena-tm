import React, {useEffect} from 'react';
import {AppState, DispatchProps} from "../redux/reduxTypes";
import {connect} from "react-redux";
import SoknadsOversiktPanel from "./parts/soknadsOversiktPanel/SoknadsOversiktPanel";
import BehandleSoknadPanel from "./parts/behandleSoknadPanel/BehandleSoknadPanel";
import {createStyles, CssBaseline, MuiThemeProvider, Theme} from "@material-ui/core";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import AppBarView from "./parts/appBarView/AppBarView";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import SystemSettingsModal from "./parts/systemSettings/SystemSettingsModal";
import StatusSnackBarView from "./parts/statusSnackBar/StatusSnackBarView";
import {getFsSoknadByFiksDigisosId, removeNullFieldsFromHendelser} from "../utils/utilityFunctions";
import ToppPanel from "./parts/panel/ToppPanel";
import CircularProgress from "@material-ui/core/CircularProgress";
import deepOrange from "@material-ui/core/colors/deepOrange";
import indigo from "@material-ui/core/colors/indigo";
import Fab from "@material-ui/core/Fab";
import {SettingsEthernet} from "@material-ui/icons";
import { hentFsSoknadFraFiksEllerOpprettNy } from '../redux/actions';
import {Model} from "../redux/types";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import SplashScreen from "../components/splashScreen";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            padding: theme.spacing(0, 4, 0, 4)
        },
        maingrid: {
            justifyContent: 'center'
        },
        left: {
            display: 'flex',
            flexDirection: 'row',
        },
        right: {
            paddingRight: 0
        },
        colJson: {
            position: 'fixed',
            bottom: '1rem',
            right: '1rem'
        },
        colRawJson: {
            position: 'fixed',
            bottom: '1rem',
            right: '1rem'
        },
        rawJson: {
            position: 'relative',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
        progressBar: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            marginTop: '-50px',
            marginLeft: '-50px'
        }
    }),
);

interface StoreProps {
    model: Model;
}

type Props = DispatchProps & StoreProps;

const V3: React.FC<Props> = (props: Props) => {

    useEffect(() => {
        hentFsSoknadFraFiksEllerOpprettNy(props.model.aktivSoknad, props.model.backendUrlTypeToUse, props.dispatch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const smallScreen = useMediaQuery('(max-width:610px)');

    const loaderOn = props.model.loaderOn;
    const muiTheme = createMuiTheme({
        palette: {
            primary: {
                light: indigo[300],
                main: indigo[500],
                dark: indigo[700]
            },
            secondary: {
                light: deepOrange[300],
                main: deepOrange[500],
                dark: deepOrange[700]
            },
            type: props.model.thememode
        }
    });
    const classes = useStyles();

    return (
        <SplashScreen>
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                <AppBarView />
                <div className={classes.root}>
                    <Grid container={true} spacing={6} className={classes.maingrid}>
                        <Grid item sm={2} className={classes.left} zeroMinWidth>
                            <SoknadsOversiktPanel />
                        </Grid>
                        {!smallScreen && <Grid item sm={1} className={classes.left} zeroMinWidth>
                            <br />
                        </Grid>}
                        <Grid item sm={9} className={classes.right} zeroMinWidth>
                            <ToppPanel />
                        </Grid>
                    </Grid>
                    <Grid container={true} spacing={6} className={classes.maingrid}>
                        <Grid item sm={12} className={classes.right} zeroMinWidth>
                            <BehandleSoknadPanel />
                        </Grid>
                    </Grid>
                </div>

                <SystemSettingsModal soknad={getFsSoknadByFiksDigisosId(props.model.soknader, props.model.aktivSoknad)} />

                <StatusSnackBarView />

                <div hidden={!loaderOn} className={classes.progressBar}>
                    <CircularProgress size={100} thickness={3} disableShrink color={'secondary'} />
                </div>

                <div className={classes.colRawJson}>
                    <div className={classes.rawJson}>
                        <Fab aria-label="add" color="primary" onClick={() => {
                            const fiksDigisosSokerJson = getFsSoknadByFiksDigisosId(props.model.soknader,props.model.aktivSoknad)!.fiksDigisosSokerJson;
                            const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(fiksDigisosSokerJson);
                            const jsonString = JSON.stringify(fiksDigisosSokerJsonUtenNull, null, 2);
                            const x = window.open("data:text/json, _blank");
                            x!.document.open();
                            x!.document.write('<html><body><pre>' + jsonString + '</pre></body></html>');
                            x!.document.close();
                        }}>
                            <SettingsEthernet/>
                        </Fab>
                    </div>
                </div>

            </MuiThemeProvider>
        </SplashScreen>
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
)(V3);
