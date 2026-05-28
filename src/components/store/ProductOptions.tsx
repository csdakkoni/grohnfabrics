'use client';

import { useState, useEffect } from 'react';

interface OptionValue {
  id: string;
  value_tr: string;
  value_en: string;
  hex_color?: string;
  price_modifier: number;
  is_available: boolean;
  images?: string[];
}

interface OptionGroup {
  id: string;
  name_tr: string;
  name_en: string;
  option_type: 'select' | 'color' | 'size' | 'radio';
  is_required: boolean;
  values: OptionValue[];
}

interface ProductOptionsProps {
  optionGroups: OptionGroup[];
  onSelectionChange: (selections: Record<string, { valueId: string; valueName: string; priceModifier: number }>) => void;
  onColorImagesChange?: (images: string[], valueId?: string) => void;
}

export default function ProductOptions({ optionGroups, onSelectionChange, onColorImagesChange }: ProductOptionsProps) {
  const [selections, setSelections] = useState<Record<string, { valueId: string; valueName: string; priceModifier: number }>>({});

  useEffect(() => {
    // Initialize with first available option for required groups
    const initial: Record<string, { valueId: string; valueName: string; priceModifier: number }> = {};
    optionGroups.forEach(group => {
      const firstAvailable = group.values.find(v => v.is_available);
      if (firstAvailable && group.is_required) {
        initial[group.id] = {
          valueId: firstAvailable.id,
          valueName: firstAvailable.value_tr,
          priceModifier: firstAvailable.price_modifier,
        };
      }
    });
    setSelections(initial);
    onSelectionChange(initial);
  }, [optionGroups]);

  const handleSelect = (groupId: string, value: OptionValue, group: OptionGroup) => {
    if (!value.is_available) return;
    
    const newSelections = {
      ...selections,
      [groupId]: {
        valueId: value.id,
        valueName: value.value_tr,
        priceModifier: value.price_modifier,
      },
    };
    setSelections(newSelections);
    onSelectionChange(newSelections);

    // If this is a color option, notify parent about the color's images
    if (group.option_type === 'color' && onColorImagesChange) {
      onColorImagesChange(value.images || [], value.id);
    }
  };

  if (optionGroups.length === 0) return null;

  return (
    <div className="space-y-6">
      {optionGroups.map((group) => (
        <div key={group.id}>
          <label className="block text-sm font-medium mb-3">
            {group.name_tr}
            {group.is_required && <span className="text-[var(--error)]">*</span>}
          </label>
          
          {/* Color Options */}
          {group.option_type === 'color' ? (
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => {
                const isSelected = selections[group.id]?.valueId === value.id;
                return (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => handleSelect(group.id, value, group)}
                    disabled={!value.is_available}
                    title={value.value_tr}
                    className={`
                      w-10 h-10 rounded-full border-2 transition-all relative
                      ${isSelected 
                        ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)] ring-offset-2' 
                        : 'border-[var(--border)] hover:border-[var(--foreground-muted)]'
                      }
                      ${!value.is_available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    style={{ backgroundColor: value.hex_color || '#ccc' }}
                  >
                    {!value.is_available && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full h-0.5 bg-[var(--error)] rotate-45 absolute" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Select/Size/Radio Options */
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => {
                const isSelected = selections[group.id]?.valueId === value.id;
                return (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => handleSelect(group.id, value, group)}
                    disabled={!value.is_available}
                    className={`
                      px-4 py-2 rounded-lg border text-sm font-medium transition-all
                      ${isSelected 
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white' 
                        : 'border-[var(--border)] hover:border-[var(--brand-primary)]'
                      }
                      ${!value.is_available ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}
                    `}
                  >
                    {value.value_tr}
                    {value.price_modifier > 0 && (
                      <span className="ml-1 text-xs opacity-75">+₺{value.price_modifier}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Value Display for Colors */}
          {group.option_type === 'color' && selections[group.id] && (
            <p className="text-sm text-[var(--foreground-muted)] mt-2">
              Seçili: {selections[group.id].valueName}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
