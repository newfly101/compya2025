import { useEffect, useState } from "react";
import { useFormFormats } from "@/domains/playerCard/utils/useFormFormats.js";
import { useDispatch } from "react-redux";
import { requestAdminPlayerCardTeamLists } from "@/domains/playerCard/store/admin/thunks.js";
import {
  HITTER_POSITION_OPTIONS,
  PITCHER_POSITION_OPTIONS,
  TRAIT_OPTIONS,
} from "@/domains/playerCard/config/PlayerTableConfig.js";

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

export const useAdminPlayerForm = () => {
  const dispatch = useDispatch();
  const { formatBirthDate, parseArray, stringifyArray } = useFormFormats();
  const [form, setForm] = useState(initialPlayerCardForm());
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [mode, setMode] = useState(null); // CREATE | EDIT
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    dispatch(requestAdminPlayerCardTeamLists());
  }, [dispatch]);

  /* -------------------- Form Core -------------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (form.meta[name] !== undefined) {
      setForm((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [name]: Number(value),
        },
      }));
    }
  };

  const handleBirthDateChange = (e) => {
    const formatted = formatBirthDate(e.target.value);

    handleChange({
      target: {
        name: "birthDate",
        value: formatted,
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
        [field]: stringifyArray(
          current.filter((item) => item !== value)
        ),
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

  /* -------------------- Close Guard -------------------- */

  const requestClose = () => {
    setConfirmCloseOpen(true);
  };

  const confirmClose = () => {
    setConfirmCloseOpen(false);
    setIsClosing(true);

    setTimeout(() => {
      setOpen(false);
      setMode(null);
      setIsClosing(false);
    }, 250); // animation duration
  };

  const cancelClose = () => {
    setConfirmCloseOpen(false);
  };

  /* -------------------- Submit -------------------- */

  const handleSubmit = () => {
    console.log("submit data", form);

    // TODO: API call

    setOpen(false);
    setMode(null);
  };

  /* -------------------- Derived -------------------- */

  const role = form.meta.role;

  const positionOptionsMap = {
    PITCHER: PITCHER_POSITION_OPTIONS,
    HITTER: HITTER_POSITION_OPTIONS,
  };

  const positionOptions = positionOptionsMap[role] || [];

  const selectedPositions = parseArray(form.meta.positions);
  const selectedTraits = parseArray(form.meta.traits);

  const availablePositions = positionOptions.filter(
    (p) => !selectedPositions.includes(p)
  );

  const availableTraits = TRAIT_OPTIONS.filter(
    (t) => !selectedTraits.includes(t)
  );

  return {
    formState: {
      form,
      open,
      edit,
      mode,
      confirmCloseOpen,
      selectedPositions,
      selectedTraits,
      availablePositions,
      availableTraits,
      isClosing,
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
}
