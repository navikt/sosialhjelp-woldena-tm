import React, {ChangeEvent} from "react";
import {connect} from "react-redux";
import {ExampleModel} from "./redux/example/exampleTypes";
import {AppState, DispatchProps} from "./redux/reduxTypes";
import {Panel} from "nav-frontend-paneler";
import {Knapp} from "nav-frontend-knapper";
import {setAppName} from "./redux/example/exampleActions";
import {Input} from "nav-frontend-skjema";
import Cog from "./components/ikoner/TannHjul";
import Form from "react-jsonschema-form";
import ReactJson from "react-json-view";
import {Hendelse} from "./types/foo";
import {mergeListsToLengthN} from "./utils/utilityFunctions";
import Lesmerpanel from "nav-frontend-lesmerpanel";
import Sidebar from "react-sidebar";

// const additionalMetaSchemas = require("ajv/lib/refs/json-schema-draft-06.json");
const initialHendelseTest = require('./digisos/initial-hendelse-test');
const hendelseSchemaTest = require('./digisos/hendelse-schema-test');
const hendelseSchema = require('./digisos/hendelse-schema');
const minimal = require('./digisos/minimal');
const digisosKomplett = require('./digisos/komplett');

const hendelserKomplett: Hendelse[] = digisosKomplett.hendelser;

function CustomFieldTemplate(props: any) {
    const {id, classNames, label, help, required, description, errors, children} = props;

    return (
        <div className={classNames}>
            <label htmlFor={id}>{label}{required ? "*" : null}</label>
            {description}
            {children}
            {errors}
            {help}
        </div>
    );
}

export const log = (type: any) => console.log.bind(console, type);

const uiSchema = {
    "ui:FieldTemplate": CustomFieldTemplate
};


interface ForsideProps {
    example: ExampleModel
}

interface ForsideState {
    input: string;
    digisosSoker: object;
    hendelserPrepared: Hendelse[];
    historyPoint: number;
    sidebarOpen: boolean;
}

type Props = ForsideProps & DispatchProps;




class Forside extends React.Component<Props, ForsideState> {

    constructor(props: Props) {
        super(props);
        this.state = {
            input: "",
            digisosSoker: initialHendelseTest,
            hendelserPrepared: minimal.hendelser,
            historyPoint: 0,
            sidebarOpen: false
        };
        this.onToggleSidebarOpen = this.onToggleSidebarOpen.bind(this);
    }

    onToggleSidebarOpen(open: boolean) {
        this.setState({ sidebarOpen: open });
    }

    handleInput(value: string) {
        this.setState({
            input: value,
        });
    }

    handleClickSystemButton() {
        this.props.dispatch(setAppName(this.state.input))
    }

    handleChange(json: any) {
        this.setState({
            digisosSoker: json.formData
        });
    }

    handleSubmit(json: any) {
        this.setState({
            digisosSoker: json.formData
        });
    }

    handleChooseHistoryPoint(idx: number){

        const komplett: Hendelse[] = digisosKomplett["hendelser"];
        const {hendelserPrepared} = this.state;

        this.setState({
            hendelserPrepared: mergeListsToLengthN(hendelserPrepared, komplett, idx + 1),
            historyPoint: idx
        })
    }

    render() {

        const {appname} = this.props.example;

        const listOfJsxHendelser = hendelserKomplett.map((hendelse: Hendelse, idx: number) => {
            const {historyPoint} = this.state;
            let buttonBackgroundColor: string;
            let buttonIcon: JSX.Element;

            if ( idx > historyPoint){
                buttonBackgroundColor = "white";
                buttonIcon = (<span className="glyphicon glyphicon-arrow-right" aria-hidden="true"></span>)
            } else if (idx === historyPoint) {
                buttonBackgroundColor = "red";
                buttonIcon = (<span className="glyphicon glyphicon-ok" aria-hidden="true"></span>)
            } else {
                buttonBackgroundColor = "grey";
                buttonIcon = (<span className="glyphicon glyphicon-arrow-right" aria-hidden="true"></span>)
            }

            const intro: JSX.Element = (
                <>
                    <p>{hendelse.type}</p>
                    <Knapp
                        style={{backgroundColor: buttonBackgroundColor}}
                        onClick={() => this.handleChooseHistoryPoint(idx)}
                    >
                        { buttonIcon }
                    </Knapp>
                </>
            );

            return (
                <li key={idx} className={"margintop"}>
                    <Lesmerpanel intro={intro} border>
                        <Form schema={hendelseSchema}
                              formData={hendelse}
                              // onChange={(json) => this.handleChange(json)}
                              // onSubmit={(json) => this.handleSubmit(json)}
                              // onError={log("errors")}
                        />
                    </Lesmerpanel>
                </li>
            );
        });


        return (
            <div className={"margintop"}>
                <Panel>
                    <div className={"columns"}>
                        <div style={{width: "30%"}} className={"columns__column"}>
                            <h3>
                                Bruker- og søknadsdata
                            </h3>
                        </div>
                        <div style={{width: "30%"}} className={"columns__column"}>
                            <Input label={'Bruker identifikator'}/>
                        </div>
                        <div style={{width: "30%"}} className={"columns__column"}>
                            <Input label={'Søknadsreferanse'}/>
                        </div>
                    </div>
                </Panel>

                <Panel>
                    <ol>
                        {listOfJsxHendelser}
                    </ol>
                </Panel>

                <Panel>
                    <div className={"column"}>
                        <div className={"jsonView"}>
                            <ReactJson src={this.state.hendelserPrepared}/>
                        </div>
                    </div>
                </Panel>
                <Sidebar
                    sidebar={<b>Sidebar content</b>}
                    open={this.state.sidebarOpen}
                    onSetOpen={this.onToggleSidebarOpen}
                    styles={{ sidebar: { background: "white" } }}
                    pullRight={true}
                >
                    <button onClick={() => this.onToggleSidebarOpen(!this.state.sidebarOpen)}>
                        Open sidebar!
                    </button>
                </Sidebar>







                <Panel>
                    <div className={"column"}>
                        <Form schema={hendelseSchemaTest}
                              formData={this.state.digisosSoker}
                              uiSchema={uiSchema}
                            // @ts-disable
                            //additionalMetaSchemas={[additionalMetaSchemas]}
                              onChange={(json) => this.handleChange(json)}
                              onSubmit={(json) => this.handleSubmit(json)}
                              onError={log("errors")}
                        />
                    </div>

                </Panel>
                <Panel>
                    <div className={"column"}>
                        <div className={"jsonView"}>
                            <ReactJson src={this.state.digisosSoker}/>
                        </div>
                    </div>
                </Panel>

                <Panel>
                    <h3>
                        Example panel
                    </h3>
                    <Input
                        label={'Enter app name:'}
                        value={this.state.input}
                        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                            this.handleInput(evt.target.value)
                        }}
                    />

                    <Knapp
                        id={"system_button"}
                        form="kompakt"
                        onClick={() => this.handleClickSystemButton()}
                    >
                        <Cog/>
                        <span className="sr-only">Submit</span>
                    </Knapp>

                    <Panel
                        border={true}
                        className={"margintop"}
                    >
                        {appname}
                    </Panel>

                </Panel>
            </div>
        )
    }

}

const mapStateToProps = (state: AppState) => ({
    example: state.example
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Forside);