import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AxiosError, AxiosPromise, AxiosResponse } from "axios";
import { useFormik, FormikProvider, FormikHelpers } from "formik";
import { object, string } from "yup";
import {
  ActionGroup,
  Alert,
  Button,
  ButtonVariant,
  ExpandableSection,
  Form,
  FormGroup,
  TextArea,
  TextInput,
} from "@patternfly/react-core";

import {
  SingleSelectFetchOptionValueFormikField,
  MultiSelectFetchOptionValueFormikField,
} from "@app/shared/components";
import { useFetchBusinessServices, useFetchTagTypes } from "@app/shared/hooks";
import { DEFAULT_SELECT_MAX_HEIGHT } from "@app/Constants";
import { createIdentity, TagTypeSortBy, updateIdentity } from "@app/api/rest";
import { Identity, Tag } from "@app/api/models";
import {
  getAxiosErrorMessage,
  getValidatedFromError,
  getValidatedFromErrorTouched,
} from "@app/utils/utils";

import "./identity-form.css";
export interface FormValues {
  application: number;
  createTime: string;
  createUser: string;
  description: string;
  encrypted: string;
  id: number;
  key: string;
  kind: string;
  name: string;
  password: string;
  settings: string;
  updateUser: string;
  user: string;
}

export interface IdentityFormProps {
  identity?: Identity;
  onSaved: (response: AxiosResponse<Identity>) => void;
  onCancel: () => void;
}

export const IdentityForm: React.FC<IdentityFormProps> = ({
  identity,
  onSaved,
  onCancel,
}) => {
  const { t } = useTranslation();

  const [error, setError] = useState<AxiosError>();

  const initialValues: FormValues = {
    application: 0,
    createTime: "some time",
    createUser: "some user",
    description: "",
    encrypted: "",
    id: 0,
    key: "",
    kind: "testing kind",
    name: "",
    password: "",
    settings: "",
    updateUser: "",
    user: "",
  };

  const validationSchema = object().shape({
    name: string()
      .trim()
      .required(t("validation.required"))
      .min(3, t("validation.minLength", { length: 3 }))
      .max(120, t("validation.maxLength", { length: 120 })),
    description: string()
      .trim()
      .max(250, t("validation.maxLength", { length: 250 })),
  });

  const onSubmit = (
    formValues: FormValues,
    formikHelpers: FormikHelpers<FormValues>
  ) => {
    const payload: Identity = {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      id: formValues.id,
      kind: formValues.kind.trim(),
      createUser: formValues.createUser.trim(),
    };

    let promise: AxiosPromise<Identity>;
    if (identity) {
      promise = updateIdentity({
        ...identity,
        ...payload,
      });
    } else {
      promise = createIdentity(payload);
    }
    promise
      .then((response) => {
        formikHelpers.setSubmitting(false);
        onSaved(response);
      })
      .catch((error) => {
        formikHelpers.setSubmitting(false);
        setError(error);
      });
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: onSubmit,
  });

  const onChangeField = (value: string, event: React.FormEvent<any>) => {
    formik.handleChange(event);
  };

  const [isBasicExpanded, setBasicExpanded] = React.useState(true);

  return (
    <FormikProvider value={formik}>
      <Form onSubmit={formik.handleSubmit}>
        {error && (
          <Alert
            variant="danger"
            isInline
            title={getAxiosErrorMessage(error)}
          />
        )}
        <ExpandableSection
          toggleText={"Basic information"}
          className="toggle"
          onToggle={() => setBasicExpanded(!isBasicExpanded)}
          isExpanded={isBasicExpanded}
        >
          <FormGroup
            label={t("terms.name")}
            fieldId="name"
            isRequired={true}
            validated={getValidatedFromError(formik.errors.name)}
            helperTextInvalid={formik.errors.name}
          >
            <TextInput
              type="text"
              name="name"
              aria-label="name"
              aria-describedby="name"
              isRequired={true}
              onChange={onChangeField}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              validated={getValidatedFromErrorTouched(
                formik.errors.name,
                formik.touched.name
              )}
            />
          </FormGroup>
          <FormGroup
            label={t("terms.description")}
            fieldId="description"
            isRequired={false}
            validated={getValidatedFromError(formik.errors.description)}
            helperTextInvalid={formik.errors.description}
          >
            <TextInput
              type="text"
              name="description"
              aria-label="description"
              aria-describedby="description"
              isRequired={true}
              onChange={onChangeField}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              validated={getValidatedFromErrorTouched(
                formik.errors.description,
                formik.touched.description
              )}
            />
          </FormGroup>
        </ExpandableSection>
        <ActionGroup>
          <Button
            type="submit"
            aria-label="submit"
            variant={ButtonVariant.primary}
            isDisabled={
              !formik.isValid ||
              !formik.dirty ||
              formik.isSubmitting ||
              formik.isValidating
            }
          >
            {!identity ? t("actions.create") : t("actions.save")}
          </Button>
          <Button
            type="button"
            aria-label="cancel"
            variant={ButtonVariant.link}
            isDisabled={formik.isSubmitting || formik.isValidating}
            onClick={onCancel}
          >
            {t("actions.cancel")}
          </Button>
        </ActionGroup>
      </Form>
    </FormikProvider>
  );
};
