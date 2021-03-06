import { FormikProps, withFormik } from "formik";
import * as React from "react";
import { Button, Form } from "semantic-ui-react";
import { Omit } from "../../helpers/types";
import { DatasetParamsBLO, DatasetTypes } from "../../messages";
import { OpenFormProps } from "../types";

// some fields have different types in the form vs. in messages
type DatasetParamsBLOForForm = Omit<DatasetParamsBLO,
    "path"
    | "type"
    | "tileshape"> & {
    tileshape: string,
};

type FormValues = DatasetParamsBLOForForm


type MergedProps = FormikProps<FormValues> & OpenFormProps<DatasetParamsBLO>;

const BLOFileParamsForm: React.SFC<MergedProps> = ({
    values,
    touched,
    errors,
    dirty,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    onCancel,
}) => {
    return (
        <Form onSubmit={handleSubmit}>
            <Form.Field>
                <label htmlFor="name">Name:</label>
                <input type="text" name="name" value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur} />
                {errors.name && touched.name && errors.name}
            </Form.Field>
            <Form.Field>
                <label htmlFor="tileshape">Tileshape:</label>
                <input type="text" name="tileshape" value={values.tileshape}
                    onChange={handleChange} onBlur={handleBlur} />
            </Form.Field>

            <Button primary={true} type="submit" disabled={isSubmitting}>Load Dataset</Button>
            <Button type="button" onClick={onCancel}>Cancel</Button>
        </Form>
    )
}

function parseNumList(nums: string) {
    return nums.split(",").map(part => +part);
}

export default withFormik<OpenFormProps<DatasetParamsBLO>, FormValues>({
    mapPropsToValues: () => ({
        name: "",
        tileshape: "1, 8, 128, 128",
        dtype: "float32",
    }),
    handleSubmit: (values, formikBag) => {
        const { onSubmit, path } = formikBag.props;
        onSubmit({
            path,
            type: DatasetTypes.BLO,
            name: values.name,
            tileshape: parseNumList(values.tileshape),
        });
    }
})(BLOFileParamsForm);
