import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useFormFormats } from "@/domains/playerCard/utils/useFormFormats.js";
import { requestAdminPlayerCardTeamLists } from "@/domains/playerCard/store/admin/thunks.js";
import {
  HITTER_POSITION_OPTIONS,
  PITCHER_POSITION_OPTIONS,
  TRAIT_OPTIONS,
} from "@/domains/playerCard/config/PlayerTableConfig.js";
import { useFormValidation } from "@/domains/playerCard/feature/admin/hooks/useFormValidation.js";
import { useCloseGuard } from "@/domains/playerCard/feature/admin/hooks/useCloseGuard.js";

const initialPlayerCardForm = () => ({
  meta: {
    cardCode: "",
    name: "",
    teamId: "",
    role: "",
    grade: "",
    overall: 0,
    backNumber: 0,
    birthDate: "",
    traits: "",
    positions: "",
    batThrow: "",
    seasonYear: "",
  },
  attributes: {},
});

const POSITION_OPTIONS_MAP = {
  PITCHER: PITCHER_POSITION_OPTIONS,
  HITTER: HITTER_POSITION_OPTIONS,
};

export const useAdminPlayerForm = () => {
  const dispatch = useDispatch();
  const { formatBirthDate, parseArray, stringifyArray } = useFormFormats();
  const [form, setForm] = useState(initialPlayerCardForm());
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // CREATE | EDIT

  const { validateForm } = useFormValidation();
  const { confirmCloseOpen, isClosing, requestClose, confirmClose, cancelClose } = useCloseGuard({
    onClose: () => {
      setOpen(false);
      setMode(null);
    },
  });

  useEffect(() => {
    dispatch(requestAdminPlayerCardTeamLists());
  }, [dispatch]);

  /* -------------------- Form Core -------------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (form.meta[name] !== undefined) {
      setForm((prev) => ({
        ...prev,
        meta: { ...prev.meta, [name]: value },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        attributes: { ...prev.attributes, [name]: Number(value) },
      }));
    }
  };

  const handleBirthDateChange = (e) => {
    handleChange({
      target: {
        name: "birthDate",
        value: formatBirthDate(e.target.value),
      },
    });
  };

  /* -------------------- Multi Select -------------------- */

  const handleAddItem = (field, value) => {
    if (!value) return;
    const current = parseArray(form.meta[field]);
    if (current.includes(value)) return;

    setForm((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: stringifyArray([...current, value]),
      },
    }));
  };

  const handleRemoveItem = (field, value) => {
    const current = parseArray(form.meta[field]);
    setForm((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: stringifyArray(current.filter((item) => item !== value)),
      },
    }));
  };

  /* -------------------- Mode -------------------- */

  const handleCreate = () => {
    setForm(initialPlayerCardForm());
    setMode("CREATE");
    setOpen(true);
  };

  const handleEdit = (card) => {
    setForm(card);
    setMode("EDIT");
    setOpen(true);
  };

  /* -------------------- Submit -------------------- */

  const handleSubmit = () => {
    if (!validateForm(form)) return;
    console.log("submit data", form);
    // TODO: API call
    setOpen(false);
    setMode(null);
  };

  /* -------------------- Derived -------------------- */

  const positionOptions = POSITION_OPTIONS_MAP[form.meta.role] || [];
  const selectedPositions = parseArray(form.meta.positions);
  const selectedTraits = parseArray(form.meta.traits);
  const availablePositions = positionOptions.filter((p) => !selectedPositions.includes(p));
  const availableTraits = TRAIT_OPTIONS.filter((t) => !selectedTraits.includes(t));

  return {
    formState: {
      form,
      open,
      mode,
      confirmCloseOpen,
      isClosing,
      selectedPositions,
      selectedTraits,
      availablePositions,
      availableTraits,
    },
    formActions: {
      handleChange,
      handleBirthDateChange,
      handleAddItem,
      handleRemoveItem,
      handleCreate,
      handleEdit,
      handleSubmit,
      requestClose,
      confirmClose,
      cancelClose,
    },
  };
};
