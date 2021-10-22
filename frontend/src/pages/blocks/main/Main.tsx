import React, { FunctionComponent, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useFormattedDate } from '../../../shared/hooks/formatted-date';
import { useFilterData } from '../../../shared/hooks/filter-data';
import { useSearch } from '../../../shared/hooks/search';
import Card from '../../../shared/components/card/Card';
import Label from '../../../shared/components/label/Label';
import Value from '../../../shared/components/value/Value';
import classes from './Main.module.scss';
import Ellipsis from '../../../shared/components/ellipsis/Ellipsis';
import { useNavigation } from '../../../shared/hooks/navigation';
import { useTimeoutPolling } from '../../../shared/hooks/timeout-polling';
import NoResults from '../../../shared/components/no-results/NoResults';
import FullScreenLoading from '../../../shared/components/fullscreen-loading/FullScreenLoading';

const Main: FunctionComponent<any> = () => {
    const { searchTerm, setPlaceholder } = useSearch();
    const { showNavigationDrawer, showSubNavigation } = useNavigation();
    const { formatDate } = useFormattedDate();
    const { data: transactions, isFetching } = useTimeoutPolling('/api/blocks/polling');
    const [firstFetch, setFirstFetch] = useState(false);

    useEffect(() => {
        if (!isFetching && !firstFetch) {
            setFirstFetch(true);
        }
    }, [isFetching]);

    useEffect(() => {
        setPlaceholder('Search for block ids, parent ids, time, ...');
        showNavigationDrawer(false);
        showSubNavigation(true);
    }, []);

    const { filteredData } = useFilterData(transactions, searchTerm);

    return (
        <>
            {filteredData &&
                filteredData.map((item: any, i) => (
                    <Card key={i} className={`${classes.card} ${item.isNew ? classes.isNew : ''}`}>
                        <div>
                            <Label>BLOCK HEIGHT</Label>
                            <Value>{item.height}</Value>
                        </div>
                        <div>
                            <Label>BLOCK ID</Label>
                            <Value>
                                <NavLink to={`/blocks/details/${item.id}`}>
                                    <Ellipsis className={classes.hash}>{item.id}</Ellipsis>
                                </NavLink>
                            </Value>
                        </div>
                        <div>
                            <Label>PARENT ID</Label>
                            <Value>
                                <NavLink to={`/blocks/details/${item.parentId}`}>
                                    <Ellipsis className={classes.hash}>{item.parentId}</Ellipsis>
                                </NavLink>
                            </Value>
                        </div>
                        <div>
                            <Label>TIME</Label>
                            <Value>{formatDate(item.timestamp)}</Value>
                        </div>
                        <div>
                            <Label>COLLECTION GUARANTEES</Label>
                            <Value>{item.collectionGuarantees.length}</Value>
                        </div>
                        <div>
                            <Label>BLOCK SEALS</Label>
                            <Value>{item.blockSeals.length}</Value>
                        </div>
                        <div>
                            <Label>SIGNATURES</Label>
                            <Value>{item.signatures.length}</Value>
                        </div>
                    </Card>
                ))}

            {!firstFetch && <FullScreenLoading />}
            {firstFetch && filteredData.length === 0 && <NoResults className={classes.noResults} />}
        </>
    );
};

export default Main;
