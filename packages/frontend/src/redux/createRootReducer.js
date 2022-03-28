import { combineReducers } from 'redux';

import { store } from '../';
import { wallet } from '../utils/wallet';
import combinedAccountReducers from './combinedAccountReducers';
import combinedMainReducers from './combinedMainReducers';

const setupAccountReducer = (history) => {
    const accounts = Object.keys(wallet.accounts);
    if (!accounts) {
        return {};
    }

    return accounts.reduce((x, accountId) => {
        const reducer = combineReducers(combinedAccountReducers(history));
        const inicialState = reducer(store?.getState()[accountId], {});

        return ({
            ...x,
            [accountId]: (state = inicialState, action) => (
                (accountId === wallet.accountId)
                    ? reducer(state, action)
                    : state
            )
        });
    }, {});
};

export default (history) => combineReducers({
    ...combinedMainReducers(history),
    ...setupAccountReducer(history)
});
