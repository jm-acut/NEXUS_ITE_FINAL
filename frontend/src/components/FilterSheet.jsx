import { useState } from "react";
import BottomSheet from "./BottomSheet.jsx";

const SORTS = [
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
    { value: "name_asc", label: "Name: A to Z" }
];

// The sheet is mounted fresh each time it opens, so the draft always starts from the current filters.
export default function FilterSheet({ initial, onApply, onClose }) {
    const [sort, setSort] = useState(initial.sort);
    const [min, setMin] = useState(initial.min);
    const [max, setMax] = useState(initial.max);
    const [error, setError] = useState("");

    const submit = (event) => {
        event.preventDefault();
        if (min !== "" && max !== "" && Number(min) > Number(max)) {
            setError("Minimum price can't be higher than the maximum.");
            return;
        }
        onApply({ sort, min, max });
    };

    const reset = () => onApply({ sort: "newest", min: "", max: "" });

    return (
        <BottomSheet title="Filter & sort" onClose={onClose}>
            <form onSubmit={submit} noValidate>
                <fieldset className="option-group">
                    <legend>Sort by</legend>
                    {SORTS.map((option) => (
                        <label key={option.value} className="option">
                            <input
                                type="radio"
                                name="sort"
                                value={option.value}
                                checked={sort === option.value}
                                onChange={() => setSort(option.value)}
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </fieldset>

                <fieldset className="option-group">
                    <legend>Price range (₱)</legend>
                    <div className="field-row">
                        <div className="field">
                            <label htmlFor="min-price">Minimum</label>
                            <input
                                id="min-price"
                                type="number"
                                min="0"
                                inputMode="numeric"
                                placeholder="0"
                                value={min}
                                onChange={(e) => setMin(e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="max-price">Maximum</label>
                            <input
                                id="max-price"
                                type="number"
                                min="0"
                                inputMode="numeric"
                                placeholder="Any"
                                value={max}
                                onChange={(e) => setMax(e.target.value)}
                            />
                        </div>
                    </div>
                    {error && <p className="field-error" role="alert">{error}</p>}
                </fieldset>

                <div className="sheet-actions">
                    <button type="button" className="btn btn-ghost" onClick={reset}>Reset</button>
                    <button type="submit" className="btn btn-primary">Show results</button>
                </div>
            </form>
        </BottomSheet>
    );
}