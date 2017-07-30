(ns kii.ui.conf.handlers
  (:require [re-frame.core :as rf]
            [kii.env :as env]
            [kii.device.keyboard :as keyboard]
            [kii.keys.firmware.map :as fw]
            [kii.keys.core :as keys]
            [ajax.core :as ajax]
            [clojure.pprint]
            [clojure.string]
            [kii.ui.conf.key-group.handlers]
            [kii.ui.conf.actions.handlers]
            [kii.ui.conf.keyboard.handlers]
            [kii.ui.conf.layer-select.handlers]
            [kii.ui.conf.config-tabs.handlers]))

(defn nav-home
  [db [_ value]]
  (assoc db
    :active-keyboard nil
    :active-panel    :home
    :conf            {}))

(rf/reg-event-db :nav/home nav-home)

(defn add-define
  [db [_ value]]
  (let [db' (update-in db [:conf :kll :defines]
                       #(conj % {:id (random-uuid) :data {:name "" :value ""}}))]
    db'))

(rf/reg-event-db :defines/add add-define)

(defn update-define
  [db [_ {:keys [id name value]}]]
  (let [db' (update-in db [:conf :kll :defines]
                       (fn [v] (mapv #(if (= (:id %) id)
                                        (assoc % :data {:name name :value value})
                                        %)
                                     v)))]
    db'))

(rf/reg-event-db :defines/update update-define)


(defn update-setting
  [db [_ setting value]]
  (let [db' (assoc-in db [:conf :kll :header setting]
                      value)]
    db'))

(rf/reg-event-db :settings/update update-setting)

(defn remove-define
  [db [_ id]]
  (let [db' (update-in db [:conf :kll :defines]
                       (fn [v] (filterv #(not= (:id %) id) v)))]
    db'))

(rf/reg-event-db :defines/remove remove-define)

(def ajax-methods {:post ajax/POST
                   :get  ajax/GET})
(rf/reg-fx
  :http
  (fn [{:keys [method uri options
               on-success on-failure]}] ; options - as expected by ajax calls
    (let [m-fn (method ajax-methods)]
      (m-fn uri (-> options
                    (assoc :handler       #(rf/dispatch (conj on-success %))
                           :error-handler #(rf/dispatch (conj on-failure %))))))))

(rf/reg-event-fx
  :start-configurator
  (fn [cofx _]
    (let [db (:db cofx)
          kbd (-> db
                  :active-keyboard
                  :product
                  keyboard/product->keyboard
                  :names
                  first)
          layout (clojure.string/replace (:active-layout db) " " "")]
      {:db (assoc db :conf {:loaded? false})
       :http {:method :get
              :uri (str env/base-uri "layouts/" kbd "-" layout ".json")
              :on-success [:load-config]
              :on-failure [:load-config-failure]
              :options {:format (ajax/json-request-format)
                        :response-format (ajax/json-response-format {:keywords? true})
                        }
              }}
      )))

(defn normalize-layers
  [layers]
  (into
    {}
    (map (fn [[layer data]]
           (let [okey (:key data)
                 ;;olabel (:label data)
                 mapped (fw/alias->key okey)
                 iec (get (keys/key->iec) (:name mapped))]
             ;;(print okey "(" olabel ") =>" mapped)
             ;;(clojure.pprint/pprint iec)
             [layer
              (keys/merge mapped iec)
              #_{:key (:name mapped)
                 :label1 (or (:label1 iec) olabel)
                 :label2 (:label2 iec)
                 :label3 (:label3 iec)}]))
         layers)))

(defn normalize-config
  [config]
  (let [matrix (:matrix config)
        min-left (apply min (map :x matrix))
        min-top (apply min (map :y matrix))
        defines (or (:defines config) [])]
    (assoc config
      :matrix  (vec (map #(merge % {:x (- (:x %) min-left)
                                    :y (- (:y %) min-top)
                                    :layers (normalize-layers (:layers %))})
                         matrix))
      :defines (mapv #({:id (random-uuid) :data %})
                     defines))))

(rf/reg-event-fx
  :load-config
  (fn [cofx [_ response]]
    (let [db (:db cofx)
          cfg (or (:conf db) {})
          config (normalize-config response)]
      (do
        ;;(clojure.pprint/pprint response)
        ;;(clojure.pprint/pprint config)
        {:db (assoc db :conf
                       (merge cfg
                              {:loaded? true
                               :active-layer 0
                               :kll config
                               :orig-kll config}))}))))


