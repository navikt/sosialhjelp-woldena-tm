import React, {ChangeEvent} from "react";
import {connect} from "react-redux";
import {ExampleModel} from "./redux/example/exampleTypes";
import {AppState, DispatchProps} from "./redux/reduxTypes";
import {Panel} from "nav-frontend-paneler";
import {Knapp} from "nav-frontend-knapper";
import {setAppName} from "./redux/example/exampleActions";
import {Input, SkjemaGruppe} from "nav-frontend-skjema";
import Cog from "./components/ikoner/TannHjul";
import Form from "react-jsonschema-form";
import ReactJson from "react-json-view";
import {Hendelse} from "./types/foo";


// const additionalMetaSchemas = require("ajv/lib/refs/json-schema-draft-06.json");
const initialHendelseTest = require('./digisos/initial-hendelse-test');
const hendelseSchema = require('./digisos/hendelse-schema-test');
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
}

type Props = ForsideProps & DispatchProps;

class Forside extends React.Component<Props, ForsideState> {

    constructor(props: Props) {
        super(props);
        this.state = {
            input: "",
            digisosSoker: initialHendelseTest,
            hendelserPrepared: minimal.hendelser,
            historyPoint: 0
        }
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

        const listOfHendelserKomplett: Hendelse[] = digisosKomplett["hendelser"];
        const hendelserPrepared: Hendelse[]  = this.state.hendelserPrepared;

        const antallDetSkalVaere: number = idx + 1;
        const antallDetForOyeblikketEr: number = hendelserPrepared.length;

        let hendelsePreparedUpdated: Hendelse[];

        if (antallDetSkalVaere < antallDetForOyeblikketEr){
            // Fjern overflødige elementer i lista. Siden det spoles tilbake i tid.
            hendelsePreparedUpdated = hendelserPrepared.slice(0, antallDetSkalVaere);
        } else {
            // Legg til nye elementer i hendelsePreparedUpdated fra komplett lista
            const hendelserALeggeTil: Hendelse[] = listOfHendelserKomplett.slice(antallDetForOyeblikketEr,antallDetSkalVaere);
            hendelsePreparedUpdated = hendelserPrepared.concat(hendelserALeggeTil);
        }
        
        this.setState({
            hendelserPrepared: hendelsePreparedUpdated,
            historyPoint: idx
        })
    }

    render() {

        const {appname} = this.props.example;

        const listOfJsxHendelser = hendelserKomplett.map((hendelse: Hendelse, idx: number) => {

            const {historyPoint} = this.state;
            const buttonText = this.state.hendelserPrepared.length > idx
                ? "Hit"
                : "Hit";

            let buttonBackgroundColor: string = "grey";

            if ( idx > historyPoint){
                buttonBackgroundColor = "white";
            } else if (idx === historyPoint) {
                buttonBackgroundColor = "red";
            }

            return (
                <li key={idx}>
                    <Panel>
                        {hendelse.type}
                        <Knapp
                            disabled={idx === 0}
                            style={{backgroundColor: buttonBackgroundColor}}
                            onClick={() => this.handleChooseHistoryPoint(idx)}
                        >
                            {buttonText}
                        </Knapp>
                    </Panel>
                </li>
            );
        });

        return (
            <div className={"margintop"}>
                <Panel>
                    <h3>
                        Bruker- og søknadsdata
                    </h3>
                    <SkjemaGruppe>
                        <Input label={'Bruker identifikator'}/>
                        <Input label={'Søknadsreferanse'}/>
                    </SkjemaGruppe>
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







                <Panel>
                    <div className={"column"}>
                        {/*<Form schema={schemaDigisosSoker}*/}
                        {/*      formData={this.state.digisosSoker}*/}
                        {/*      additionalMetaSchemas={[additionalMetaSchemas]}*/}
                        {/*      onChange={(json) => this.handleChange(json)}*/}
                        {/*      onSubmit={(json) => this.handleSubmit(json)}*/}
                        {/*      onError={log("errors")}*/}
                        {/*/>*/}

                        <Form schema={hendelseSchema}
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
