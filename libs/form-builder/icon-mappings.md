# Form Builder Component Icons

This document tracks the current icons used for every form builder component descriptor against their original intended icons. 

Because the `@vialiq/icons` package only contains a limited subset of specific icons (many of them medical or specific UI interactions), several components have been mapped to icons that do not semantically match their purpose.

## Text & Number Inputs
| Component Type | Current Icon Used | Original Intention |
| :--- | :--- | :--- |
| **Text Box** | `pencil` | *text-cursor* |
| **Email Address** | `user` | *at-sign* |
| **Password** | `lock` | *lock* |
| **Phone Number** | `hospital` | *phone* |
| **Number** | `calculator-simple` | *hash* |
| **Long Text (Text Area)** | `document` | *align-left* |

## Selection Inputs
| Component Type | Current Icon Used | Original Intention |
| :--- | :--- | :--- |
| **Dropdown / Select** | `chevron-down` | *chevrons-up-down* |
| **Multi-Select** | `search` | *list-filter* |
| **Checkbox (Single)** | `check-circle` | *square-check* |
| **Radio Group** | `check-circle` | *circle-dot* |
| **Checkbox Group** | `task-checklist` | *list-checks* |

## Date & Time
| Component Type | Current Icon Used | Original Intention |
| :--- | :--- | :--- |
| **Date Picker** | `calendar` | *calendar* |
| **Time Picker** | `clock` | *clock* |
| **Date & Time** | `alarm-clock` | *calendar-clock* |

## Utility & Actions
| Component Type | Current Icon Used | Original Intention |
| :--- | :--- | :--- |
| **Hidden Field** | `x` | *eye-off* |
| **Static Text** | `document` | *file-text* |
| **Divider** | `minus` | *minus* |
| **Button** | `plus` | *square* |
| **Submit Button** | `upload` | *send* |

## Structural Layouts
| Component Type | Current Icon Used | Original Intention |
| :--- | :--- | :--- |
| **Panel / Section** | `building` | *layout-panel-top* |
| **Columns Layout** | `folder-download` | *columns* |
| **Tabs Layout** | `folder-download` | *folder-open* |
| **Container / Box** | `save` | *box* |
| **Repeater** | `document` | *copy* |

---

> [!WARNING]
> Mappings like using `hospital` for Phone Numbers, `folder-download` for Columns/Tabs, and `building` for Panels were automated fallbacks because there were no structurally accurate equivalents in the `@vialiq/icons` package. These should ideally be replaced with proper Lucide icons.
