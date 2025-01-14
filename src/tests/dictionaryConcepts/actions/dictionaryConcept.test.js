import moxios from 'moxios';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { notify } from 'react-notify-toast';
import instance from '../../../config/axiosConfig';
import {
  IS_FETCHING,
  FETCH_DICTIONARY_CONCEPT,
  FILTER_BY_CLASS,
  FILTER_BY_SOURCES,
  CREATE_NEW_NAMES,
  REMOVE_ONE_NAME,
  ADD_NEW_DESCRIPTION,
  REMOVE_ONE_DESCRIPTION,
  CLEAR_FORM_SELECTIONS,
  CREATE_NEW_CONCEPT,
  ADD_CONCEPT_TO_DICTIONARY,
  FETCH_EXISTING_CONCEPT,
  EDIT_CONCEPT_ADD_DESCRIPTION,
  EDIT_CONCEPT_REMOVE_ONE_DESCRIPTION,
  CLEAR_PREVIOUS_CONCEPT,
  EDIT_CONCEPT_CREATE_NEW_NAMES,
  EDIT_CONCEPT_REMOVE_ONE_NAME,
  UPDATE_CONCEPT,
  FETCH_EXISTING_CONCEPT_ERROR,
  REMOVE_CONCEPT,
  REMOVE_MAPPING,
  ADD_SELECTED_ANSWERS,
  PRE_POPULATE_ANSWERS,
  ADD_NEW_ANSWER_ROW,
  REMOVE_SELECTED_ANSWER,
  UNPOPULATE_PRE_POPULATED_ANSWERS,
  UN_POPULATE_THIS_ANSWER,
  ADD_NEW_SET_ROW,
  REMOVE_SELECTED_SET,
  ADD_SELECTED_SETS,
  PRE_POPULATE_SETS,
  UNPOPULATE_PRE_POPULATED_SETS,
  UNPOPULATE_SET,
  CLEAR_FILTERS,
} from '../../../redux/actions/types';
import {
  fetchDictionaryConcepts,
  filterByClass,
  filterBySource,
  createNewName,
  removeNewName,
  addNewDescription,
  removeDescription,
  clearSelections,
  createNewConcept,
  queryAnswers,
  addConceptToDictionary,
  paginateConcepts,
  fetchExistingConcept,
  addDescriptionForEditConcept,
  removeDescriptionForEditConcept,
  clearPreviousConcept,
  createNewNameForEditConcept,
  removeNameForEditConcept,
  updateConcept,
  addSelectedAnswersToState,
  addAnswerMappingToConcept,
  addNewAnswerRow,
  removeSelectedAnswer,
  unpopulatePrepopulatedAnswers,
  prepopulateAnswers,
  unretireMapping,
  unPopulateThisAnswer,
  addNewSetRow,
  removeSelectedSet,
  addSelectedSetsToState,
  addSetMappingToConcept,
  prePopulateSets,
  unpopulatePrepopulatedSets,
  unpopulateSet,
  buildNewMappingData,
  fetchConceptsFromASource, buildUpdateMappingData,
  clearAllFilters,
} from '../../../redux/actions/concepts/dictionaryConcepts';
import {
  removeDictionaryConcept,
  removeConceptMapping,
  removeEditedConceptMapping,
} from '../../../redux/actions/dictionaries/dictionaryActionCreators';
import { removeMapping } from '../../../redux/actions/dictionaries/dictionaryActions';
import concepts, {
  mockConceptStore,
  newConcept,
  newConceptData,
  multipleConceptsMockStore,
  newConceptDataWithAnswerAndSetMappings,
  existingConcept, sampleConcept, conceptWithoutMappings, conceptThatIsNotTheLatestVersion,
} from '../../__mocks__/concepts';
import {
  CIEL_SOURCE_URL,
  INTERNAL_MAPPING_DEFAULT_SOURCE,
  MAP_TYPE,
  MAP_TYPES_DEFAULTS,
  getUsername,
} from '../../../components/dictionaryConcepts/components/helperFunction';
import api from '../../../redux/api';
import { externalSource, internalSource } from '../../__mocks__/sources';
import mappings from '../../__mocks__/mappings';
import { PROCEDURE_CLASS } from '../../../constants';

jest.mock('uuid/v4', () => jest.fn(() => 1));
jest.mock('react-notify-toast');
const mockStore = configureStore([thunk]);

describe('Test suite for dictionary concept actions', () => {
  beforeEach(() => {
    moxios.install(instance);
  });

  afterEach(() => {
    moxios.uninstall(instance);
  });

  it('should query possible answer concepts', async () => {
    const expectedAnswers = [{
      id: 'Answer 1',
      url: 'url',
      source: 'source',
      display_name: 'display_name',
    }];

    const expectedResult = [{
      id: 'Answer 1',
      url: 'url',
      source: 'source',
      display_name: 'display_name',
      map_type: MAP_TYPE.questionAndAnswer,
      value: 'url',
      label: 'source: display_name',
    }];

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: expectedAnswers });
    });
    const result = await queryAnswers('source', 'query');
    expect(result).toEqual(expectedResult);
  });

  it('should query possible answer concepts from CIEL', async () => {
    const expectedAnswers = [{
      id: 'CIEL 1',
      url: 'url',
      source: 'source',
      display_name: 'display_name',
    }];

    const expectedResult = [{
      id: 'CIEL 1',
      url: 'url',
      source: 'source',
      display_name: 'display_name',
      map_type: MAP_TYPE.questionAndAnswer,
      value: 'url',
      label: 'source: display_name',
    }];

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: expectedAnswers });
    });
    const result = await queryAnswers(INTERNAL_MAPPING_DEFAULT_SOURCE, 'query');
    expect(result).toEqual(expectedResult);
  });

  it('should handle FETCH_DICTIONARY_CONCEPT', () => {
    const expectedConcepts = [concepts, sampleConcept];
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: expectedConcepts,
      });
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: FETCH_DICTIONARY_CONCEPT, payload: expectedConcepts },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);

    return store.dispatch(fetchDictionaryConcepts('orgs', 'CIEL', 'CIEL')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should return only the latest version of each concept', () => {
    const conceptData = [concepts, conceptThatIsNotTheLatestVersion];

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: conceptData,
      });
    });

    const store = mockStore(mockConceptStore);

    return store.dispatch(fetchDictionaryConcepts()).then(() => {
      expect(store.getActions()[1]).toEqual({
        type: FETCH_DICTIONARY_CONCEPT,
        payload: [concepts],
      });
    });
  });

  it('should handle FETCH_DICTIONARY_CONCEPT_WITH_SOURCE_FILTERS', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: [concepts],
      });
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: FETCH_DICTIONARY_CONCEPT, payload: [concepts] },
      { type: IS_FETCHING, payload: false },
    ];

    mockConceptStore.concepts.filteredBySource = ['CIEL'];
    const store = mockStore(mockConceptStore);

    return store.dispatch(fetchDictionaryConcepts('orgs', 'CIEL', 'CIEL')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle FETCH_DICTIONARY_CONCEPT_WITH_CLASS_FILTERS', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: [concepts],
      });
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: FETCH_DICTIONARY_CONCEPT, payload: [concepts] },
      { type: IS_FETCHING, payload: false },
    ];

    mockConceptStore.concepts.filteredBySource = [];
    mockConceptStore.concepts.filteredByClass = [PROCEDURE_CLASS];
    const store = mockStore(mockConceptStore);

    return store.dispatch(fetchDictionaryConcepts('orgs', 'CIEL', 'CIEL')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle FETCH_DICTIONARY_CONCEPT_WITH_CLASS_AND_SOURCE_FILTERS', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: [concepts],
      });
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: FETCH_DICTIONARY_CONCEPT, payload: [concepts] },
      { type: IS_FETCHING, payload: false },
    ];

    mockConceptStore.concepts.filteredBySource = ['CIEL'];
    mockConceptStore.concepts.filteredByClass = [PROCEDURE_CLASS];
    const store = mockStore({ ...mockConceptStore, filteredByClass: [PROCEDURE_CLASS] });

    return store.dispatch(fetchDictionaryConcepts('orgs', 'CIEL', 'CIEL')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle error in FETCH_DICTIONARY_CONCEPT', () => {
    const notifyMock = jest.fn();
    notify.show = notifyMock;

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 400,
        response: { detail: 'bad request' },
      });
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: FETCH_DICTIONARY_CONCEPT, payload: [] },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);

    return store.dispatch(fetchDictionaryConcepts('orgs', 'CIEL', 'CIEL')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyMock).toHaveBeenCalledWith('bad request', 'error', 3000);
    });
  });

  it('should handle any unknown error in FETCH_DICTIONARY_CONCEPT', () => {
    const notifyMock = jest.fn();
    notify.show = notifyMock;

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 400,
      });
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: FETCH_DICTIONARY_CONCEPT, payload: [] },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);

    return store.dispatch(fetchDictionaryConcepts('orgs', 'CIEL', 'CIEL')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyMock).toHaveBeenCalledWith('Network Error. Please try again later!', 'error', 6000);
    });
  });


  it('should handle CREATE_NEW_CONCEPT with answer and set mappings', (done) => {
    const store = mockStore(mockConceptStore);
    const url = '/orgs/IHTSDO/sources/SNOMED-CT/concepts/';

    moxios.stubRequest(/(.*?)/, {
      status: 201,
      response: newConcept,
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: ADD_CONCEPT_TO_DICTIONARY, payload: newConcept },
      { type: IS_FETCHING, payload: false },
      { type: CREATE_NEW_CONCEPT, payload: newConcept },
      { type: IS_FETCHING, payload: false },
    ];

    store.dispatch(createNewConcept(newConceptDataWithAnswerAndSetMappings, url)).then(() => {
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
      done();
    });
  });

  it('should handle CREATE_NEW_CONCEPT', () => {
    moxios.stubRequest(/(.*?)/, {
      status: 201,
      response: newConcept,
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: ADD_CONCEPT_TO_DICTIONARY, payload: newConcept },
      { type: IS_FETCHING, payload: false },
      { type: CREATE_NEW_CONCEPT, payload: newConcept },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const url = '/orgs/IHTSDO/sources/SNOMED-CT/concepts/';
    return store.dispatch(createNewConcept(newConceptData, url)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle REMOVE_CONCEPT', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: '/users/admin/sources/858738987555379984/mappings/5bff9fb3bdfb8801a1702975/',
      });
    });

    const expectedActions = [
      { type: REMOVE_CONCEPT, payload: newConcept.version_url },
    ];

    const store = mockStore(mockConceptStore);
    const data = { references: ['/orgs/IHTSDO/sources/SNOMED-CT/concepts/12845003/73jifjibL83/'] };
    const type = 'users';
    const owner = 'alexmochu';
    const collectionId = 'Tech';
    return store.dispatch(removeDictionaryConcept(data, type, owner, collectionId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle REMOVE_MAPPINGS', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 201,
        response: [],
      });
    });

    const expectedActions = [
      {
        type: REMOVE_MAPPING,
        payload: '/users/admin/sources/858738987555379984/mappings/5bff9fb3bdfb8801a1702975/',
      },
      {
        payload: true,
        type: '[ui] toggle spinner',
      },
    ];

    const store = mockStore(mockConceptStore);
    const data = { references: ['/users/admin/sources/858738987555379984/mappings/5bff9fb3bdfb8801a1702975/'] };
    const type = 'users';
    const owner = 'alexmochu';
    return store.dispatch(removeConceptMapping(data, type, owner)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle REMOVE_MAPPING network error', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.reject({
        status: 599,
        response: {
          data: { detail: 'Cannot remove mapping' },
        },
      });
    });

    const expectedActions = [
      { type: REMOVE_MAPPING, payload: '/users/admin/sources/858738987555379984/mappings/5bff9fb3bdfb8801a1702975/' },
    ];

    const store = mockStore(mockConceptStore);
    const data = { references: ['/users/admin/sources/858738987555379984/mappings/5bff9fb3bdfb8801a1702975/'] };
    const type = 'users';
    const owner = 'alexmochu';
    const collectionId = 'Tech';
    return store.dispatch(removeConceptMapping(data, type, owner, collectionId)).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle REMOVE_CONCEPT network error', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.reject({
        status: 599,
        response: newConcept.version_url,
      });
    });

    const expectedActions = [
      { type: REMOVE_CONCEPT, payload: newConcept.version_url },
    ];

    const store = mockStore(mockConceptStore);
    const data = { references: ['/orgs/IHTSDO/sources/SNOMED-CT/concepts/12845003/73jifjibL83/'] };
    const type = 'users';
    const owner = 'alexmochu';
    const collectionId = 'Tech';
    return store.dispatch(removeDictionaryConcept(data, type, owner, collectionId)).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle error in CREATE_NEW_CONCEPT', () => {
    const notifyMock = jest.fn();
    notify.show = notifyMock;

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 400,
        response: { __all__: 'Could not create concept' },
      });
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const url = '/orgs/IHTSDO/sources/SNOMED-CT/concepts/';
    return store.dispatch(createNewConcept(newConceptData, url)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyMock).toHaveBeenCalledWith(
        'An error occurred when creating a concept.\n Could not create concept for __all__', 'error', 5000,
      );
    });
  });

  it('should handle any unknown error in createNewConcept', () => {
    const notifyMock = jest.fn();
    notify.show = notifyMock;

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.reject({});
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const url = '/orgs/IHTSDO/sources/SNOMED-CT/concepts/';
    return store.dispatch(createNewConcept(newConceptData, url)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyMock).toHaveBeenCalledWith('An error occurred when creating a concept. Please retry.', 'error', 2000);
    });
  });

  it('should handle ADD_CONCEPT_TO_DICTIONARY', () => {
    const listMappingsFromAConceptInASourceMock = jest.fn(() => []);
    listMappingsFromAConceptInASourceMock.mockResolvedValueOnce({
      data: [mappings[0]],
    });
    const addReferencesToCollectionMock = jest.fn();
    addReferencesToCollectionMock.mockResolvedValue({
      data: {
        added: true,
      },
    });

    api.mappings.list.fromAConceptInASource = listMappingsFromAConceptInASourceMock;
    api.dictionaries.addReferencesToCollection = addReferencesToCollectionMock;

    const expectedActions = [
      { type: ADD_CONCEPT_TO_DICTIONARY, payload: { added: true } },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const url = '/orgs/IHTSDO/sources/SNOMED-CT/concepts/';
    return store.dispatch(addConceptToDictionary(newConceptData, url)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
  it('should handle error in ADD_CONCEPT_TO_DICTIONARY', () => {
    const listMappingsFromAConceptInASourceMock = jest.fn(() => []);
    listMappingsFromAConceptInASourceMock.mockResolvedValueOnce({
      data: [mappings[0]],
    });
    const addReferencesToCollectionMock = jest.fn();
    addReferencesToCollectionMock.mockRejectedValueOnce({ response: 'bad request' });

    api.mappings.list.fromAConceptInASource = listMappingsFromAConceptInASourceMock;
    api.dictionaries.addReferencesToCollection = addReferencesToCollectionMock;

    const expectedActions = [{ type: IS_FETCHING, payload: false }];

    const store = mockStore(mockConceptStore);
    const url = '/orgs/IHTSDO/sources/SNOMED-CT/concepts/';
    return store.dispatch(addConceptToDictionary(newConceptData, url)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle FETCH_EXISTING_CONCEPT', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: existingConcept,
      });
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: FETCH_EXISTING_CONCEPT, payload: existingConcept },
      { type: PRE_POPULATE_ANSWERS, payload: [] },
      { type: PRE_POPULATE_SETS, payload: [] },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const conceptUrl = '/orgs/EthiopiaNHDD/sources/HMIS-Indicators/concepts/C1.1.1.1/';
    return store.dispatch(fetchExistingConcept(conceptUrl)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should dispatch the right actions when mappings are empty', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: conceptWithoutMappings,
      });
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: FETCH_EXISTING_CONCEPT, payload: conceptWithoutMappings },
      { type: PRE_POPULATE_ANSWERS, payload: [] },
      { type: PRE_POPULATE_SETS, payload: [] },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const conceptUrl = '/orgs/EthiopiaNHDD/sources/HMIS-Indicators/concepts/C1.1.1.1/';
    return store.dispatch(fetchExistingConcept(conceptUrl)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('Testing Edit concept actions ', () => {
  beforeEach(() => {
    moxios.install(instance);
  });

  afterEach(() => {
    moxios.uninstall(instance);
  });
  it('should handle FETCH_EXISTING_CONCEPT', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: existingConcept,
      });
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: FETCH_EXISTING_CONCEPT, payload: existingConcept },
      { type: PRE_POPULATE_ANSWERS, payload: [] },
      { type: PRE_POPULATE_SETS, payload: [] },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const conceptUrl = '/orgs/EthiopiaNHDD/sources/HMIS-Indicators/concepts/C1.1.1.1/';
    return store.dispatch(fetchExistingConcept(conceptUrl)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle EDIT_CONCEPT_ADD_DESCRIPTION', () => {
    const expectedActions = [
      { type: EDIT_CONCEPT_ADD_DESCRIPTION, payload: 1 },
    ];

    const store = mockStore(mockConceptStore);

    store.dispatch(addDescriptionForEditConcept());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle EDIT_CONCEPT_REMOVE_ONE_DESCRIPTION', () => {
    const expectedActions = [
      { type: EDIT_CONCEPT_REMOVE_ONE_DESCRIPTION, payload: 1 },
    ];

    const store = mockStore(mockConceptStore);

    store.dispatch(removeDescriptionForEditConcept(1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle CLEAR_PREVIOUS_CONCEPT', () => {
    const expectedActions = [
      { type: CLEAR_PREVIOUS_CONCEPT },
    ];

    const store = mockStore(mockConceptStore);

    store.dispatch(clearPreviousConcept());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle EDIT_CONCEPT_CREATE_NEW_NAMES', () => {
    const expectedActions = [
      { type: EDIT_CONCEPT_CREATE_NEW_NAMES, payload: 1 },
    ];

    const store = mockStore(mockConceptStore);

    store.dispatch(createNewNameForEditConcept());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle EDIT_CONCEPT_REMOVE_ONE_NAME', () => {
    const expectedActions = [
      { type: EDIT_CONCEPT_REMOVE_ONE_NAME, payload: 1 },
    ];

    const store = mockStore(mockConceptStore);

    store.dispatch(removeNameForEditConcept(1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle UPDATE_CONCEPT', () => {
    const listReferencesInCollectionMock = jest.fn(() => ({ data: [{ version_url: '/test/url/' }] }));
    const deleteReferencesFromCollectionMock = jest.fn();

    api.mappings.list.fromAConceptInACollection = listReferencesInCollectionMock;
    api.dictionaries.references.delete.fromACollection = deleteReferencesFromCollectionMock;

    moxios.stubRequest(/(.*?)/, {
      status: 200,
      response: existingConcept,
    });

    const history = {
      goBack: () => '',
    };

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: UPDATE_CONCEPT, payload: existingConcept },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const conceptUrl = '/orgs/EthiopiaNHDD/sources/HMIS-Indicators/concepts/C1.1.1.1/';

    expect(deleteReferencesFromCollectionMock).not.toHaveBeenCalled();
    return store.dispatch(updateConcept(conceptUrl, existingConcept, history, 'HMIS-Indicators', existingConcept)).then(() => {
      expect(deleteReferencesFromCollectionMock).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should not attempt to delete references when the data is empty', () => {
    const listReferencesInCollectionMock = jest.fn(() => ({ data: [] }));
    const deleteReferencesFromCollectionMock = jest.fn();

    api.mappings.list.fromAConceptInACollection = listReferencesInCollectionMock;
    api.dictionaries.references.delete.fromACollection = deleteReferencesFromCollectionMock;

    moxios.stubRequest(/(.*?)/, {
      status: 200,
      response: existingConcept,
    });

    const history = {
      goBack: () => '',
    };

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: UPDATE_CONCEPT, payload: existingConcept },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const conceptUrl = '/orgs/EthiopiaNHDD/sources/HMIS-Indicators/concepts/C1.1.1.1/';

    expect(deleteReferencesFromCollectionMock).not.toHaveBeenCalled();
    return store.dispatch(updateConcept(conceptUrl, existingConcept, history, 'HMIS-Indicators', existingConcept)).then(() => {
      expect(deleteReferencesFromCollectionMock).not.toHaveBeenCalled();
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('updateConcept should still return the updated concept if updating the mappings fails', async () => {
    const dispatchMock = jest.fn();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: existingConcept });
    });
    const result = await updateConcept()(dispatchMock);
    expect(result).toEqual(existingConcept);
  });

  it('should handle error in FETCH_EXISTING_CONCEPT_ERROR for update concept', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 400,
        response: 'bad request',
      });
    });

    const history = {
      goBack: () => '',
    };

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: FETCH_EXISTING_CONCEPT_ERROR, payload: 'bad request' },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const conceptUrl = '/orgs/EthiopiaNHDD/sources/HMIS-Indicators/concepts/C1.1.1.1/';
    return store.dispatch(updateConcept(conceptUrl, existingConcept, history, 'HMIS-Indicators', existingConcept)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle any unknown error in updateConcept', () => {
    const notifyMock = jest.fn();
    notify.show = notifyMock;

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.reject({});
    });

    const history = {
      goBack: () => '',
    };

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const conceptUrl = '/orgs/EthiopiaNHDD/sources/HMIS-Indicators/concepts/C1.1.1.1/';
    return store.dispatch(updateConcept(conceptUrl, existingConcept, history, 'HMIS-Indicators', existingConcept)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(notifyMock).toHaveBeenCalledWith('An error occurred when updating the concept. Please retry.', 'error', 2000);
    });
  });

  it('should unretire a Mapping when the unretireMapping action is triggered', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: existingConcept });
    });
    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: UPDATE_CONCEPT, payload: existingConcept },
    ];
    const store = mockStore(mockConceptStore);
    const conceptUrl = '/orgs/EthiopiaNHDD/sources/HMIS-Indicators/concepts/C1.1.1.1/';
    return store.dispatch(unretireMapping(conceptUrl)).then((result) => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(result.retired).toEqual(false);
    });
  });

  it('should handle exceptions for unretire a Mapping', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 400 });
    });
    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: IS_FETCHING, payload: false },
    ];
    const store = mockStore(mockConceptStore);
    const conceptUrl = '/orgs/EthiopiaNHDD/sources/HMIS-Indicators/concepts/C1.1.1.1/';
    return store.dispatch(unretireMapping(conceptUrl)).then((result) => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(result).toEqual(null);
    });
  });

  it('should handle error in FETCH_EXISTING_CONCEPT_ERROR for fetching exing concepts', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 400,
        response: 'bad request',
      });
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: FETCH_EXISTING_CONCEPT_ERROR, payload: 'bad request' },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const conceptUrl = '/orgs/EthiopiaNHDD/sources/HMIS-Indicators/concepts/C1.1.1.1/';
    return store.dispatch(fetchExistingConcept(conceptUrl)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should not dispatch the error object if it is empty', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.reject({});
    });

    const expectedActions = [
      { type: IS_FETCHING, payload: true },
      { type: IS_FETCHING, payload: false },
    ];

    const store = mockStore(mockConceptStore);
    const conceptUrl = '/orgs/EthiopiaNHDD/sources/HMIS-Indicators/concepts/C1.1.1.1/';
    return store.dispatch(fetchExistingConcept(conceptUrl)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle unpopulating a selected answer', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 201,
        response: [],
      });
    });

    const data = { references: ['/users/admin/sources/858738987555379984/mappings/5bff9fb3bdfb8801a1702975/'] };

    const expectedActions = [
      removeMapping(data.references[0]),
    ];

    const store = mockStore(mockConceptStore);
    return store.dispatch(removeEditedConceptMapping(data)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle failed request to unpopulate a selected answer', () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 500,
        response: [],
      });
    });

    const showNetworkError = jest.fn();
    const data = { references: ['/users/admin/sources/858738987555379984/mappings/5bff9fb3bdfb8801a1702975/'] };

    const store = mockStore(mockConceptStore);
    return store.dispatch(removeEditedConceptMapping(data)).then().catch((error) => {
      expect(error).toBeTruthy();
      expect(showNetworkError).toHaveBeenCalled();
    });
  });
});


describe('test for search filter by class', () => {
  const store = mockStore(mockConceptStore);
  const expectedActions = [
    { type: FILTER_BY_CLASS, payload: 'MapType' },
  ];

  store.dispatch(filterByClass('MapType', 'users', 'emasys', 'dev-col', 'classes', ''));
  expect(store.getActions()).toEqual(expectedActions);
});

describe('test for search filter by source', () => {
  const store = mockStore(mockConceptStore);
  const expectedActions = [
    { type: FILTER_BY_SOURCES, payload: 'MapType' },
  ];

  store.dispatch(filterBySource('MapType', 'users', 'emasys', 'dev-col', 'source', ''));
  expect(store.getActions()).toEqual(expectedActions);
});

describe('clearAllFilters', () => {
  it('should dispatch CLEAR_FILTERS with the right type', () => {
    const store = mockStore(mockConceptStore);
    const filterType = 'sources';
    const expectedActions = [
      { type: CLEAR_FILTERS, payload: filterType },
    ];

    store.dispatch(clearAllFilters(filterType));
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('test suite for synchronous action creators', () => {
  beforeEach(() => {
    moxios.install(instance);
  });

  afterEach(() => {
    moxios.uninstall(instance);
  });

  it('should handle CREATE_NEW_NAMES', () => {
    const store = mockStore(mockConceptStore);
    const expectedActions = [{ type: CREATE_NEW_NAMES, payload: 1 }];
    store.dispatch(createNewName());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle REMOVE_ONE_NAME', () => {
    const store = mockStore(mockConceptStore);
    const expectedActions = [{ type: REMOVE_ONE_NAME, payload: 1 }];
    store.dispatch(removeNewName(1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle ADD_NEW_DESCRIPTION', () => {
    const store = mockStore(mockConceptStore);
    const expectedActions = [{ type: ADD_NEW_DESCRIPTION, payload: 1 }];
    store.dispatch(addNewDescription());
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should handle REMOVE_ONE_DESCRIPTION', () => {
    const store = mockStore(mockConceptStore);
    const expectedActions = [{ type: REMOVE_ONE_DESCRIPTION, payload: 1 }];
    store.dispatch(removeDescription(1));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('should handle CLEAR_FORM_SELECTIONS', () => {
    const store = mockStore(mockConceptStore);
    const expectedActions = [{ type: CLEAR_FORM_SELECTIONS, payload: [] }];
    store.dispatch(clearSelections());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle ADD_SELECTED_ANSWERS', () => {
    const expectedActions = [
      { type: ADD_SELECTED_ANSWERS, payload: { answer: [{}], uniqueKey: undefined } },
    ];
    const store = mockStore(mockConceptStore);
    store.dispatch(addSelectedAnswersToState([{}]));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle ADD_NEW_ANSWER_ROW', () => {
    const store = mockStore(mockConceptStore);
    const expectedActions = [{ type: ADD_NEW_ANSWER_ROW, payload: {} }];
    store.dispatch(addNewAnswerRow({}));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle REMOVE_SELECTED_ANSWER', () => {
    const store = mockStore(mockConceptStore);
    const expectedActions = [{ type: REMOVE_SELECTED_ANSWER, payload: 'uniqueKey' }];
    store.dispatch(removeSelectedAnswer('uniqueKey'));
    expect(store.getActions()).toEqual(expectedActions);
  });

  describe('addNewSetRow', () => {
    it('dispatches ADD_NEW_SET_ROW action', () => {
      const store = mockStore(mockConceptStore);
      const setRow = {};
      const expectedActions = [{ type: ADD_NEW_SET_ROW, payload: setRow }];
      expect(store.getActions()).not.toEqual(expectedActions);
      store.dispatch(addNewSetRow(setRow));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('addSelectedSetsToState', () => {
    it('dispatches ADD_SELECTED_SETS action', () => {
      const sets = [{}];
      const expectedActions = [
        { type: ADD_SELECTED_SETS, payload: { set: sets, uniqueKey: undefined } },
      ];
      const store = mockStore(mockConceptStore);
      expect(store.getActions()).not.toEqual(expectedActions);
      store.dispatch(addSelectedSetsToState(sets));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('removeSelectedSet', () => {
    it('dispatches REMOVE_SELECTED_SET', () => {
      const store = mockStore(mockConceptStore);
      const key = 'uniqueKey';
      const expectedActions = [{ type: REMOVE_SELECTED_SET, payload: key }];
      expect(store.getActions()).not.toEqual(expectedActions);
      store.dispatch(removeSelectedSet(key));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle UNPOPULATE_PRE_POPULATED_ANSWERS', () => {
    const store = mockStore(mockConceptStore);
    const expectedActions = [{ type: UNPOPULATE_PRE_POPULATED_ANSWERS }];
    store.dispatch(unpopulatePrepopulatedAnswers());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle UNPOPULATE_PRE_POPULATED_SETS', () => {
    const store = mockStore(mockConceptStore);
    const expectedActions = [{ type: UNPOPULATE_PRE_POPULATED_SETS }];
    expect(store.getActions()).not.toEqual(expectedActions);
    store.dispatch(unpopulatePrepopulatedSets());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle PRE_POPULATE_ANSWERS', () => {
    const store = mockStore(mockConceptStore);
    const expectedActions = [{
      type: PRE_POPULATE_ANSWERS,
      payload: [{ retired: false, prePopulated: true }],
    }];
    store.dispatch(prepopulateAnswers([{ retired: false, prePopulated: true }]));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should dispatch UN_POPULATE_THIS_ANSWER action type', () => {
    const store = mockStore(mockConceptStore);
    const answer = {
      frontEndUniqueKey: 'unique',
      prePopulated: true,
    };
    const newAnswer = {
      frontEndUniqueKey: 'unique',
      prePopulated: false,
    };
    const expectedActions = [{
      type: UN_POPULATE_THIS_ANSWER,
      payload: newAnswer,
    }];
    store.dispatch(unPopulateThisAnswer(answer));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should dispatch UNPOPULATE_SET action type', () => {
    const store = mockStore(mockConceptStore);
    const set = {
      frontEndUniqueKey: 'unique',
      prePopulated: true,
    };
    const newSet = {
      frontEndUniqueKey: 'unique',
      prePopulated: false,
    };
    const expectedActions = [{
      type: UNPOPULATE_SET,
      payload: newSet,
    }];
    store.dispatch(unpopulateSet(set));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should handle PRE_POPULATE_SETS', () => {
    const store = mockStore(mockConceptStore);
    const expectedActions = [{
      type: PRE_POPULATE_SETS,
      payload: [{ retired: false, prePopulated: true }],
    }];
    store.dispatch(prePopulateSets([{ retired: false, prePopulated: true }]));
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('Add answer mappings to concept', () => {
  beforeEach(() => {
    moxios.install(instance);
  });

  afterEach(() => {
    moxios.uninstall(instance);
  });

  it('should add all chosen answer mappings', async () => {
    const url = '/url/test/';

    let data;

    const mappingData = [
      {
        url: 'some/test.url',
        map_scope: 'Internal',
        map_type: 'Same as',
        to_concept_code: '429b6715-774d-4d64-b043-ae5e177df57f',
        to_concept_name: 'CIEL: MALARIAL SMEAR',
        to_concept_source: '/orgs/CIEL/sources/CIEL/concepts/32/',
      },
    ];

    const expected = [{
      data: {
        created_at: '2018-12-17T13:32:26.644',
        created_by: 'admin',
        external_id: null,
        extras: null,
        from_concept_code: 'd06c3088-29e4-495a-9a67-62f41e2ab28f',
        from_concept_name: 'jfjf',
        from_concept_url: '/url/test/',
        from_source_name: '2197623860455254',
        from_source_owner: 'admin',
        from_source_owner_type: 'User',
        from_source_url: null,
        id: '5c17ebba389b5a0050817d89',
        map_type: 'Same as',
        owner: 'admin',
        owner_type: 'User',
        retired: false,
        source: '2197623860455254',
        to_concept_code: '1366',
        to_concept_name: 'MALARIA SMEAR, QUALITATIVE',
        to_concept_url: '/orgs/CIEL/sources/CIEL/concepts/1366/',
        to_source_name: 'CIEL',
        to_source_owner: 'CIEL',
        to_source_owner_type: 'Organization',
        to_source_url: CIEL_SOURCE_URL,
        type: 'Mapping',
        updated_at: '2018-12-17T13:32:26.769',
        updated_by: 'admin',
        url: '/users/admin/sources/2197623',
      },
    },
    ];

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      data = request.config.data;
      request.respondWith({
        status: 201,
        response: expected,
      });
    });
    await addAnswerMappingToConcept(url, '2434435454545', mappingData);
    expect(data).toEqual(JSON.stringify({
      map_type: mappingData[0].map_type,
      from_concept_url: url,
      to_concept_url: mappingData[0].url,
      external_id: '1',
    }));
  });

  it('should handle error while creating answer mappings', async () => {
    const notifyMock = jest.fn();
    notify.show = notifyMock;

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.reject({ status: 400, response: {} });
    });

    expect(notifyMock).not.toHaveBeenCalled();
    await addAnswerMappingToConcept('/test/url', 'testSource', [{
      map_type: 'Q-AND-A',
      from_concept_url: '/test/from/url/',
      to_concept_url: '/test/to/url/',
    }]);
    expect(notifyMock).toHaveBeenCalled();
  });
});

describe('Add set mappings to concept', () => {
  beforeEach(() => {
    moxios.install(instance);
  });

  afterEach(() => {
    moxios.uninstall(instance);
  });

  it('should add all chosen set mappings', (done) => {
    const mappingData = [
      {
        external_id: '1',
        url: 'some/test.url',
        map_scope: 'Internal',
        map_type: 'Set',
        to_concept_code: '429b6715-774d-4d64-b043-ae5e177df57f',
        to_concept_name: 'CIEL: MALARIAL SMEAR',
        to_concept_source: '/orgs/CIEL/sources/CIEL/concepts/32/',
      },
    ];

    const url = '/url/test/';
    const source = '2434435454545';
    const username = getUsername()
    const mappingUrl = `/users/${username}/sources/${source}/mappings/`;

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();

      expect(request.config.data).toEqual(JSON.stringify({
        map_type: mappingData[0].map_type,
        from_concept_url: url,
        to_concept_url: mappingData[0].url,
        external_id: mappingData[0].external_id,
      }));
      expect(request.url.indexOf(mappingUrl)).toBeGreaterThan(-1);

      request.respondWith({ status: 201, response: {} }).then(() => {
        done();
      });
    });

    addSetMappingToConcept(url, source, mappingData);
  });

  it('should notify the user if error occurs when adding set mappings', (done) => {
    const mappingData = [
      {
        url: 'some/test.url',
        map_scope: 'Internal',
        map_type: 'Set',
        to_concept_code: '429b6715-774d-4d64-b043-ae5e177df57f',
        to_concept_name: 'CIEL: MALARIAL SMEAR',
        to_concept_source: '/orgs/CIEL/sources/CIEL/concepts/32/',
      },
    ];

    const notifyShowMock = jest.fn();
    notify.show = notifyShowMock;
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.reject({ status: 400, response: {} });
    });

    addSetMappingToConcept('/url/test/', 'source', mappingData).then(() => {
      expect(notifyShowMock).toHaveBeenCalledWith(
        'A network error occurred while adding your set mappings. Please retry.',
        'error',
        3000,
      );
      done();
    });
  });
});

describe('buildNewMappingData', () => {
  const fromConceptUrl = '/test/from/concept/url';
  const toConceptCode = 'testCode';
  const toConceptName = 'testName';
  const mapType = MAP_TYPES_DEFAULTS[0];
  const external_id = '1';

  it('buildNewMappingData should return the map_type, from_concept_url, to_source_url, to_concept_code, to_concept_name if given an external concept', () => {
    const mapping = {
      sourceObject: externalSource,
      map_type: mapType,
      to_concept_code: toConceptCode,
      to_concept_name: toConceptName,
    };
    const expectedMapping = {
      external_id: external_id,
      map_type: mapType,
      from_concept_url: fromConceptUrl,
      to_source_url: mapping.sourceObject.url,
      to_concept_code: toConceptCode,
      to_concept_name: toConceptName,
    };
    expect(buildNewMappingData(mapping, fromConceptUrl)).toEqual(expectedMapping);
  });

  it('buildNewMappingData should return the map_type, from_concept_url, to_concept_url, to_concept_name if given an internal concept', () => {
    const mapping = {
      sourceObject: internalSource,
      map_type: mapType,
      to_concept_code: toConceptCode,
      to_concept_name: toConceptName,
    };
    const expectedMapping = {
      external_id: external_id,
      map_type: mapType,
      from_concept_url: fromConceptUrl,
      to_concept_url: `${mapping.sourceObject.url}concepts/${toConceptCode}/`,
      to_concept_name: toConceptName,
    };
    expect(buildNewMappingData(mapping, fromConceptUrl)).toEqual(expectedMapping);
  });
});

describe('buildUpdateMappingData', () => {
  const toConceptCode = 'testCode';
  const toConceptName = 'testName';
  const mapType = MAP_TYPES_DEFAULTS[0];

  it('buildUpdateMappingData should return the map_type, to_source_url, to_concept_code, to_concept_name if given an external concept', () => {
    const mapping = {
      sourceObject: externalSource,
      map_type: mapType,
      to_concept_code: toConceptCode,
      to_concept_name: toConceptName,
    };
    const expectedMapping = {
      map_type: mapType,
      to_source_url: mapping.sourceObject.url,
      to_concept_code: toConceptCode,
      to_concept_name: toConceptName,
    };
    expect(buildUpdateMappingData(mapping)).toEqual(expectedMapping);
  });

  it('buildUpdateMappingData should return the map_type, to_concept_url, to_concept_name if given an internal concept', () => {
    const mapping = {
      sourceObject: internalSource,
      map_type: mapType,
      to_concept_code: toConceptCode,
      to_concept_name: toConceptName,
    };
    const expectedMapping = {
      map_type: mapType,
      to_concept_url: `${mapping.sourceObject.url}concepts/${toConceptCode}/`,
      to_concept_name: toConceptName,
    };
    expect(buildUpdateMappingData(mapping)).toEqual(expectedMapping);
  });
});

describe('fetchConceptsFromASource', () => {
  const conceptsInASourceMock = jest.fn();
  const notifyMock = jest.fn();
  const sourceUrl = 'test/url';
  const query = '/test query';

  beforeEach(() => {
    notify.show = notifyMock;
    api.concepts.list.conceptsInASource = conceptsInASourceMock;
    conceptsInASourceMock.mockClear();
    notifyMock.mockClear();
  });

  it('should call the fetch concepts endpoint method with the right arguments', async () => {
    await fetchConceptsFromASource(sourceUrl, query);
    expect(conceptsInASourceMock).toHaveBeenCalledTimes(1);
    expect(conceptsInASourceMock).toHaveBeenCalledWith(sourceUrl, query);
  });

  it('should notify the user in case of an unknown error', async () => {
    api.concepts.list.conceptsInASource = jest.fn().mockImplementationOnce(() => {
      throw {
        response: {
          data: 'error',
        },
      };
    });
    await fetchConceptsFromASource(sourceUrl, query);
    expect(notifyMock).toHaveBeenCalledWith('Could not load concepts: error. Please retry.', 'error', 2000);
  });
});
