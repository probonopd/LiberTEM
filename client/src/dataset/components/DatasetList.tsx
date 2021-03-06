import * as React from "react";
import { connect } from "react-redux";
import BrowserWrapper from "../../browser/components/BrowserWrapper";
import { RootReducer } from "../../store";
import { DatasetsState } from "../types";
import Dataset from "./Dataset";
import DatasetOpen from "./DatasetOpen";

interface DatasetListProps {
    datasets: DatasetsState
}

const mapStateToProps = (state: RootReducer) => {
    return {
        datasets: state.datasets,
        formVisible: state.openDataset.formVisible,
        formPath: state.openDataset.formPath,
    };
}

type MergedProps = DatasetListProps & ReturnType<typeof mapStateToProps>;

class DatasetList extends React.Component<MergedProps> {
    public render() {
        const { formVisible, datasets } = this.props;

        return (
            <>
                {datasets.ids.map(dsId => <Dataset dataset={datasets.byId[dsId]} key={dsId} />)}
                {formVisible && <DatasetOpen />}
                <BrowserWrapper />
            </>
        );
    }
}

export default connect(mapStateToProps)(DatasetList);