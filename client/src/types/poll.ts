/** Domain (backend) models **/
export type PollStatus = 'opened' | 'closed'

export type QuestionSubType = 'short' | 'paragraph' | 'date' | 'single' | 'multiple'
export type ChoiceSubType = Extract<QuestionSubType, 'single' | 'multiple'>

export interface Question {
    _id?: string
    title: string
    type: 'open' | 'multiple_choice'
    subType: QuestionSubType
    /** uniquement pour les questions à choix */
    options?: string[]
}

export interface CreatorRef { _id: string; name?: string; email?: string }

export interface Poll {
    _id: string
    name: string
    description?: string
    status: PollStatus
    creator: string | CreatorRef
    questions: Question[]
    createdAt?: string
    updatedAt?: string
}

/** Vue “stats” retournée par l’API */
export interface PollStats {
    totalResponses: number
    questions: Array<{
        _id: string
        title: string
        type: 'open' | 'multiple_choice'
        total?: number
        stats?: Array<{ option: string; count: number }>
        topAnswers?: string[]
        responses?: Array<{ _id: string; user: CreatorRef; answer: string }>
    }>
}

/** --- Types UI (éditeur) --- */

/** Une option dans l’éditeur (avec id client pour le v-for, etc.) */
export interface ChoiceOptionVM { id: string; label: string }

/** Type d’éditeur (sélection “famille” de question dans l’UI) */
export type EditorType = 'text' | 'multi'

/** ViewModel d’édition d’une question (côté front) */
export interface QuestionEditorVM {
    id: string              // id client (uuid) pour le rendu / tri
    _id?: string            // id serveur si la question existe déjà
    type: EditorType        // 'text' (open-ended) | 'multi' (choix)
    label: string
    subType: QuestionSubType
    options?: ChoiceOptionVM[]   // sous-forme objets pour l’édition
}

/** VM avec verrouillage si des réponses existent (édition) */
export interface QuestionEditorWithLock extends QuestionEditorVM {
    hasResponses?: boolean
}

/** --- DTO Poll (payloads API) --- */
export interface CreatePollDTO {
    name: string
    description?: string
    questions: Question[]
}

export type UpdatePollDTO = CreatePollDTO
