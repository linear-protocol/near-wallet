import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import ActiveMethod from './ActiveMethod';
import InactiveMethod from './InactiveMethod';
import RecoveryIcon from '../../../images/icon-recovery-grey.svg';
import ErrorIcon from '../../../images/icon-problems.svg';
import { Snackbar, snackbarDuration } from '../../common/Snackbar';
import { Translate } from 'react-localize-redux';
import { generateSeedPhrase } from 'near-seed-phrase';
import { setupRecoveryMessage, deleteRecoveryMethod, loadRecoveryMethods } from '../../../actions/account';

const Container = styled.div`

    border: 2px solid #e6e6e6;
    border-radius: 6px;

    > div {
        padding: 15px 20px;
        border-bottom: 2px solid #f8f8f8;

        &:last-of-type {
            border-bottom: 0;
        }
    }

    button {
        font-size: 14px;
        width: 100px;
        font-weight: 600;
        height: 40px;
        letter-spacing: 0.5px;
    }

`

const Header = styled.div`
    padding: 20px !important;
`

const Title = styled.div`
    font-family: BwSeidoRound;
    color: #24272a;
    font-size: 22px;
    display: flex;
    align-items: center;

    &:before {
        content: '';
        background: center center no-repeat url(${RecoveryIcon});
        width: 28px;
        height: 28px;
        display: inline-block;
        margin-right: 10px;
        margin-top: -2px;
    }
`

const NoRecoveryMethod = styled.div`
    margin-top: 15px;
    color: #FF585D;
    display: flex;
    align-items: center;

    &:before {
        content: '';
        background: center center no-repeat url(${ErrorIcon});
        min-width: 28px;
        width: 28px;
        min-height: 28px;
        height: 28px;
        display: block;
        margin-right: 10px;
    }
`

class RecoveryContainer extends Component {

    state = {
        successSnackbar: false,
    };

    handleEnableMethod = (method) => {
        this.props.history.push(`${method !== 'phrase' ? '/set-recovery/' : '/setup-seed-phrase/'}${this.props.accountId}`);
    }

    handleDeleteMethod = (method) => {
        this.props.deleteRecoveryMethod(method)
            .then(({ error }) => {
                if (error) return
                this.props.loadRecoveryMethods(this.props.accountId)
        })
    }

    handleResendLink = (method) => {
        //TODO: Delete old key before sending
        const { seedPhrase, publicKey } = generateSeedPhrase();
        const { accountId, setupRecoveryMessage } = this.props;
        const { kind, detail } = method;
        let phoneNumber, email;

        if (kind === 'email') {
            email = detail;
        } else if (kind === 'phone') {
            phoneNumber = detail;
        }

        setupRecoveryMessage({ accountId, phoneNumber, email, publicKey, seedPhrase })
            .then(({ error }) => {
                if (error) return

                this.setState({ successSnackbar: true }, () => {
                    setTimeout(() => {
                        this.setState({successSnackbar: false});
                    }, snackbarDuration)
                });
            })
    }
 
    render() {

        const { activeMethods } = this.props;
        const allMethods = ['email', 'phone', 'phrase'];
        const inactiveMethods = allMethods.filter((method) => !activeMethods.map(method => method.kind).includes(method));
        
        return (
            <Container>
                <Header>
                    <Title><Translate id='recoveryMgmt.title'/></Title>
                    {!activeMethods.length &&
                        <NoRecoveryMethod>
                            <Translate id='recoveryMgmt.noRecoveryMethod'/>
                        </NoRecoveryMethod>
                    }
                </Header>
                {activeMethods.map((method, i) =>
                    <ActiveMethod
                        key={i}
                        data={method}
                        onResend={() => this.handleResendLink(method)}
                        onDelete={() => this.handleDeleteMethod(method)}
                    />
                )}
                {inactiveMethods.map((method, i) =>
                    <InactiveMethod
                        key={i}
                        kind={method}
                        onEnable={() => this.handleEnableMethod(method)}
                    />
                )}
                <Snackbar
                    theme='success'
                    message={<Translate id='recoveryMgmt.recoveryLinkSent'/>}
                    show={this.state.successSnackbar}
                    onHide={() => this.setState({ successSnackbar: false })}
                />
            </Container>
        );
    }
}

const mapDispatchToProps = {
    setupRecoveryMessage,
    deleteRecoveryMethod,
    loadRecoveryMethods
}

const mapStateToProps = () => ({})

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RecoveryContainer));